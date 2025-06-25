const Paystack = require('paystack');
const crypto = require('crypto');

class PaystackService {
  constructor() {
    this.paystack = new Paystack(process.env.PAYSTACK_SECRET_KEY);
    this.publicKey = process.env.PAYSTACK_PUBLIC_KEY;
    this.currency = 'GHS'; // Ghana Cedis
  }

  /**
   * Ghana-specific mobile money providers configuration
   */
  getMobileMoneyProviders() {
    return {
      mtn: {
        name: 'MTN Mobile Money',
        channels: ['mtn'],
        numberPrefixes: ['024', '054', '055', '059'],
        testNumbers: ['024000000000', '054000000000']
      },
      telecel: {
        name: 'Telecel Cash',
        channels: ['telecel'],
        numberPrefixes: ['050'],
        testNumbers: ['050000000000']
      },
      airteltigo: {
        name: 'AirtelTigo Money',
        channels: ['atl'],
        numberPrefixes: ['026', '056', '027', '057'],
        testNumbers: ['026000000000', '027000000000']
      }
    };
  }

  /**
   * Get Ghana-specific bank list with local bank codes
   * @returns {Promise<Object>} Banks list response
   */
  async getGhanaBanks() {
    try {
      const response = await this.paystack.misc.list_banks({ country: 'ghana' });
      
      // Enhance with local bank information
      const ghanaBanks = response.data.map(bank => ({
        ...bank,
        isGhanaBank: true,
        supports_mobile_money: this.bankSupportsMobileMoney(bank.code),
        ghipss_member: true // Most Ghana banks are GhIPSS members
      }));

      return {
        success: true,
        banks: ghanaBanks,
        count: ghanaBanks.length
      };
    } catch (error) {
      console.error('Ghana banks fetch error:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch Ghana banks list'
      };
    }
  }

  /**
   * Check if bank supports mobile money integration
   * @param {string} bankCode - Bank code
   * @returns {boolean} Whether bank supports mobile money
   */
  bankSupportsMobileMoney(bankCode) {
    // Major Ghana banks that support mobile money
    const mobileMoneySupportingBanks = [
      '050', // Ghana Commercial Bank
      '010', // Bank of Ghana
      '030', // National Investment Bank
      '040', // ADB Bank
      '080', // Cal Bank
      '090', // Ecobank Ghana
      '180', // Fidelity Bank
      '200', // Zenith Bank Ghana
    ];
    
    return mobileMoneySupportingBanks.includes(bankCode);
  }

  /**
   * Validate Ghana phone number format
   * @param {string} phoneNumber - Phone number to validate
   * @returns {Object} Validation result
   */
  validateGhanaPhoneNumber(phoneNumber) {
    const cleanNumber = phoneNumber.replace(/[\s\-\(\)]/g, '');
    const ghanaPhoneRegex = /^(\+233|0)(2[0-9]|5[0-9])\d{7}$/;
    
    const isValid = ghanaPhoneRegex.test(cleanNumber);
    const provider = isValid ? this.detectMobileMoneyProvider(cleanNumber) : null;
    
    return {
      isValid,
      cleanNumber: isValid ? cleanNumber : null,
      provider,
      formatExample: '+233 24 XXX XXXX'
    };
  }

  /**
   * Detect mobile money provider from phone number
   * @param {string} phoneNumber - Phone number
   * @returns {string|null} Provider code
   */
  detectMobileMoneyProvider(phoneNumber) {
    const cleanNumber = phoneNumber.replace(/[\s\-\(\)]/g, '');
    const number = cleanNumber.startsWith('+233') ? cleanNumber.slice(4) : 
                   cleanNumber.startsWith('0') ? cleanNumber.slice(1) : cleanNumber;
    
    const providers = this.getMobileMoneyProviders();
    
    for (const [code, provider] of Object.entries(providers)) {
      if (provider.numberPrefixes.some(prefix => number.startsWith(prefix.slice(1)))) {
        return code;
      }
    }
    
    return null;
  }

  /**
   * Create a subaccount for a farmer with Ghana-specific enhancements
   * @param {Object} farmerData - Farmer account information
   * @returns {Promise<Object>} Subaccount creation response
   */
  async createFarmerSubaccount(farmerData) {
    try {
      const {
        businessName,
        email,
        paymentAccount,
        phoneNumber,
        description,
        percentageCharge = 10, // Platform commission (10%)
        metadata = {},
        ghanaCardNumber,
        tinNumber
      } = farmerData;

      let subaccountData = {
        business_name: businessName,
        percentage_charge: percentageCharge,
        description: description || `Farmer account for ${businessName}`,
        primary_contact_email: email,
        primary_contact_name: `${farmerData.firstName} ${farmerData.lastName}`,
        primary_contact_phone: phoneNumber,
        metadata: {
          ...metadata,
          farmer_id: farmerData.farmerId,
          payment_method: paymentAccount.method,
          country: 'Ghana',
          currency: this.currency,
          ghana_card_number: ghanaCardNumber,
          tin_number: tinNumber,
          created_at: new Date().toISOString()
        }
      };

      // Configure based on payment method
      if (paymentAccount.method === 'bank') {
        subaccountData.settlement_bank = paymentAccount.bankAccount.bankCode;
        subaccountData.account_number = paymentAccount.bankAccount.accountNumber;
        subaccountData.metadata.account_name = paymentAccount.bankAccount.accountName;
        subaccountData.metadata.bank_name = paymentAccount.bankAccount.bankName;
      } else if (paymentAccount.method === 'mobile_money') {
        // For mobile money, we'll use a special handling
        subaccountData.metadata.mobile_money_provider = paymentAccount.mobileMoneyAccount.provider;
        subaccountData.metadata.mobile_money_number = paymentAccount.mobileMoneyAccount.phoneNumber;
        
        // Use a default bank for settlement (can be changed later)
        subaccountData.settlement_bank = '050'; // GCB Bank as default
        subaccountData.account_number = '0000000000'; // Placeholder
      }

      const response = await this.paystack.subaccount.create(subaccountData);
      return {
        success: true,
        data: response.data,
        subaccountCode: response.data.subaccount_code,
        paymentMethod: paymentAccount.method
      };
    } catch (error) {
      console.error('Paystack subaccount creation error:', error);
      return {
        success: false,
        error: error.message || 'Failed to create farmer payment account'
      };
    }
  }

  /**
   * Initialize payment with Ghana-specific mobile money support
   * @param {Object} paymentData - Payment initialization data
   * @returns {Promise<Object>} Payment initialization response
   */
  async initializePayment(paymentData) {
    try {
      const {
        email,
        amount,
        orderReference,
        subaccountCode,
        paymentMethod = 'card', // 'card', 'mobile_money', 'bank_transfer'
        mobileMoneyProvider,
        bearerType = 'subaccount',
        metadata = {}
      } = paymentData;

      const initializationData = {
        email,
        amount: Math.round(amount * 100), // Convert to pesewas (Ghana's smallest currency unit)
        reference: orderReference,
        currency: this.currency,
        callback_url: `${process.env.FRONTEND_URL}/payment/callback`,
        metadata: {
          ...metadata,
          order_reference: orderReference,
          payment_type: 'product_purchase',
          country: 'Ghana'
        }
      };

      // Add channels based on payment method
      if (paymentMethod === 'mobile_money') {
        const providers = this.getMobileMoneyProviders();
        if (mobileMoneyProvider && providers[mobileMoneyProvider]) {
          initializationData.channels = providers[mobileMoneyProvider].channels;
        } else {
          // Enable all mobile money channels
          initializationData.channels = ['mtn', 'telecel', 'atl'];
        }
      } else if (paymentMethod === 'bank_transfer') {
        initializationData.channels = ['bank'];
      } else {
        // Default to all available channels
        initializationData.channels = ['card', 'bank', 'mtn', 'telecel', 'atl'];
      }

      // Add subaccount for split payment if provided
      if (subaccountCode) {
        initializationData.subaccount = subaccountCode;
        initializationData.bearer = bearerType;
        
        // Calculate platform fee in pesewas
        const platformFee = Math.round(amount * 0.10 * 100); // 10% platform fee
        initializationData.transaction_charge = platformFee;
      }

      const response = await this.paystack.transaction.initialize(initializationData);
      return {
        success: true,
        data: response.data,
        authorizationUrl: response.data.authorization_url,
        accessCode: response.data.access_code,
        reference: response.data.reference,
        paymentMethod,
        currency: this.currency
      };
    } catch (error) {
      console.error('Payment initialization error:', error);
      return {
        success: false,
        error: error.message || 'Failed to initialize payment'
      };
    }
  }

  /**
   * Verify payment transaction with Ghana-specific processing
   * @param {string} reference - Transaction reference
   * @returns {Promise<Object>} Verification response
   */
  async verifyPayment(reference) {
    try {
      const response = await this.paystack.transaction.verify(reference);
      const transaction = response.data;
      
      return {
        success: true,
        data: transaction,
        status: transaction.status,
        amount: transaction.amount / 100, // Convert from pesewas to cedis
        paidAt: transaction.paid_at,
        channel: transaction.channel,
        reference: transaction.reference,
        currency: transaction.currency,
        fees: transaction.fees ? transaction.fees / 100 : 0,
        // Ghana-specific fields
        isMobileMoney: ['mtn', 'telecel', 'atl'].includes(transaction.channel),
        mobileMoneyProvider: this.getMobileMoneyProviderFromChannel(transaction.channel),
        gatewayResponse: transaction.gateway_response
      };
    } catch (error) {
      console.error('Payment verification error:', error);
      return {
        success: false,
        error: error.message || 'Failed to verify payment'
      };
    }
  }

  /**
   * Get mobile money provider from Paystack channel
   * @param {string} channel - Payment channel
   * @returns {string|null} Provider code
   */
  getMobileMoneyProviderFromChannel(channel) {
    const channelMap = {
      'mtn': 'mtn',
      'telecel': 'telecel',
      'atl': 'airteltigo'
    };
    
    return channelMap[channel] || null;
  }

  /**
   * Process refund with Ghana-specific handling
   * @param {string} transactionReference - Original transaction reference
   * @param {number} amount - Refund amount (optional, full refund if not provided)
   * @param {string} reason - Refund reason
   * @returns {Promise<Object>} Refund response
   */
  async processRefund(transactionReference, amount = null, reason = '') {
    try {
      const refundData = {
        transaction: transactionReference,
        currency: this.currency
      };

      if (amount) {
        refundData.amount = Math.round(amount * 100); // Convert to pesewas
      }

      if (reason) {
        refundData.customer_note = reason;
        refundData.merchant_note = `Refund processed: ${reason}`;
      }

      const response = await this.paystack.refund.create(refundData);
      return {
        success: true,
        data: response.data,
        refundAmount: response.data.amount / 100, // Convert back to cedis
        status: response.data.status,
        refundReference: response.data.reference,
        currency: this.currency
      };
    } catch (error) {
      console.error('Refund processing error:', error);
      return {
        success: false,
        error: error.message || 'Failed to process refund'
      };
    }
  }

  /**
   * Create payment link with Ghana-specific features
   * @param {Object} linkData - Payment link data
   * @returns {Promise<Object>} Payment link response
   */
  async createPaymentLink(linkData) {
    try {
      const {
        name,
        description,
        amount,
        currency = this.currency,
        redirectUrl,
        collectPhone = true,
        metadata = {}
      } = linkData;

      const paymentLinkData = {
        name,
        description,
        amount: Math.round(amount * 100), // Convert to pesewas
        currency,
        redirect_url: redirectUrl,
        collect_phone: collectPhone,
        metadata: {
          ...metadata,
          country: 'Ghana'
        }
      };

      const response = await this.paystack.payment_page.create(paymentLinkData);
      return {
        success: true,
        data: response.data,
        paymentUrl: response.data.hosted_url,
        reference: response.data.reference
      };
    } catch (error) {
      console.error('Payment link creation error:', error);
      return {
        success: false,
        error: error.message || 'Failed to create payment link'
      };
    }
  }

  /**
   * Verify bank account details
   * @param {string} accountNumber - Bank account number
   * @param {string} bankCode - Bank code
   * @returns {Promise<Object>} Verification response
   */
  async verifyBankAccount(accountNumber, bankCode) {
    try {
      const response = await this.paystack.verification.resolveAccountNumber({
        account_number: accountNumber,
        bank_code: bankCode
      });

      return {
        success: true,
        accountName: response.data.account_name,
        accountNumber: response.data.account_number,
        bankId: response.data.bank_id
      };
    } catch (error) {
      console.error('Bank account verification error:', error);
      return {
        success: false,
        error: error.message || 'Failed to verify bank account'
      };
    }
  }

  /**
   * Get list of supported banks
   * @returns {Promise<Object>} Banks list response
   */
  async getBanks() {
    try {
      const response = await this.paystack.misc.list_banks();
      return {
        success: true,
        banks: response.data
      };
    } catch (error) {
      console.error('Banks fetch error:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch banks list'
      };
    }
  }

  /**
   * Get transaction history for a subaccount
   * @param {string} subaccountCode - Subaccount code
   * @param {Object} options - Query options (page, perPage, from, to)
   * @returns {Promise<Object>} Transaction history response
   */
  async getSubaccountTransactions(subaccountCode, options = {}) {
    try {
      const queryParams = {
        subaccount: subaccountCode,
        perPage: options.perPage || 50,
        page: options.page || 1
      };

      if (options.from) queryParams.from = options.from;
      if (options.to) queryParams.to = options.to;

      const response = await this.paystack.transaction.list(queryParams);
      return {
        success: true,
        data: response.data,
        pagination: {
          total: response.meta.total,
          perPage: response.meta.perPage,
          page: response.meta.page,
          pageCount: response.meta.pageCount
        }
      };
    } catch (error) {
      console.error('Subaccount transactions fetch error:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch transaction history'
      };
    }
  }

  /**
   * Verify webhook signature
   * @param {string} payload - Raw webhook payload
   * @param {string} signature - Paystack signature header
   * @returns {boolean} Verification result
   */
  verifyWebhookSignature(payload, signature) {
    try {
      const hash = crypto
        .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY)
        .update(payload, 'utf-8')
        .digest('hex');
      
      return hash === signature;
    } catch (error) {
      console.error('Webhook signature verification error:', error);
      return false;
    }
  }

  /**
   * Update subaccount details
   * @param {string} subaccountCode - Subaccount code
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} Update response
   */
  async updateSubaccount(subaccountCode, updateData) {
    try {
      const response = await this.paystack.subaccount.update(subaccountCode, updateData);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Subaccount update error:', error);
      return {
        success: false,
        error: error.message || 'Failed to update subaccount'
      };
    }
  }
}

module.exports = new PaystackService(); 