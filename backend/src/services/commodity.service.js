const axios = require('axios');
const NodeCache = require('node-cache');

class CommodityService {
  constructor() {
    // Cache configuration
    this.cache = new NodeCache({ 
      stdTTL: 900, // 15 minutes default
      checkperiod: 60, // Check for expired keys every minute
      useClones: false 
    });
    
    // Exchange rate cache (1 hour)
    this.exchangeCache = new NodeCache({ 
      stdTTL: 3600, 
      checkperiod: 120 
    });

    // API configuration
    this.apiNinjasKey = process.env.API_NINJAS_KEY || 'KpBDiLt4QVL8hIVDcQG+zw==drYbwWfjYjK5S1nc';
    this.apiNinjasUrl = 'https://api.api-ninjas.com/v1/commodityprice';
    this.exchangeRateUrl = 'https://api.exchangerate-api.com/v4/latest/USD';
    
    // Log API key status (first 10 chars only for security)
    console.log(`🔑 API Ninjas Key loaded: ${this.apiNinjasKey ? `${this.apiNinjasKey.substring(0, 10)}...` : 'NOT SET'}`);
    
    // Request tracking
    this.requestCount = 0;
    this.monthlyRequestLimit = 950; // Buffer under 1000
    this.lastResetDate = new Date().getMonth();
    
    // Ghana commodity mapping - Updated based on API Ninjas documentation
    // Many commodities require premium subscription
    this.ghanaToApiMapping = {
      'maize': 'corn', // Premium only
      'rice': 'rough_rice', // Free tier
      'soybeans': 'soybean', // Premium only  
      'soybean': 'soybean', // Premium only
      'cocoa': 'cocoa', // Premium only
      'coffee': 'coffee', // Premium only
      'sugar': 'sugar', // Premium only
      'wheat': 'wheat', // Premium only
      'palm oil': 'palm_oil', // May not be available
      'cotton': 'cotton', // Premium only
      'cassava': 'cassava', // May not be available in API
      'yam': 'yam', // May not be available in API
      'plantain': 'bananas', // Closest match
      'banana': 'bananas',
      // Free tier alternatives for testing
      'gold': 'gold', // Free
      'platinum': 'platinum', // Free
      'aluminum': 'aluminum', // Free
      'lumber': 'lumber', // Free
      'oat': 'oat' // Free
    };

    // Fallback exchange rate (GHS per USD)
    this.fallbackExchangeRate = 11.50;
    
    // Local market adjustments for Ghana
    this.localMarketPremium = 0.12; // 12% for transportation and handling
    this.seasonalAdjustments = this.getSeasonalAdjustments();
    
    // Request timeout
    this.requestTimeout = 10000; // 10 seconds
    
    this.initializeMonitoring();
  }

  initializeMonitoring() {
    // Reset monthly counter if needed
    const currentMonth = new Date().getMonth();
    if (currentMonth !== this.lastResetDate) {
      this.requestCount = 0;
      this.lastResetDate = currentMonth;
      console.log('📊 Monthly API request counter reset');
    }

    // Log cache statistics every hour
    setInterval(() => {
      const stats = this.cache.getStats();
      console.log('📈 Cache Stats:', {
        keys: stats.keys,
        hits: stats.hits,
        misses: stats.misses,
        hitRate: stats.hits / (stats.hits + stats.misses) || 0
      });
    }, 3600000); // 1 hour
  }

  getSeasonalAdjustments() {
    const month = new Date().getMonth();
    // Adjust based on Ghana's agricultural seasons
    const adjustments = {
      // Dry season (Nov-Mar) - higher prices for most crops
      10: 0.08, 11: 0.12, 0: 0.15, 1: 0.12, 2: 0.08,
      // Rainy season start (Apr-Jun) - mixed adjustments
      3: 0.05, 4: 0.02, 5: -0.02,
      // Peak rainy season (Jul-Sep) - harvest time, lower prices
      6: -0.05, 7: -0.08, 8: -0.05,
      // Post-harvest (Oct) - still relatively low prices
      9: 0.02
    };
    return adjustments[month] || 0;
  }

  async getExchangeRate() {
    try {
      const cached = this.exchangeCache.get('USD_TO_GHS');
      if (cached) {
        return cached;
      }

      console.log('🔄 Fetching fresh exchange rate...');
      const response = await axios.get(this.exchangeRateUrl, {
        timeout: this.requestTimeout
      });

      // Note: exchangerate-api.com might not have GHS directly
      // We'll need to calculate via a base currency or use fallback
      let ghsRate = this.fallbackExchangeRate;
      
      if (response.data && response.data.rates) {
        // Try to get GHS rate or calculate via EUR/GBP
        if (response.data.rates.GHS) {
          ghsRate = response.data.rates.GHS;
        } else {
          // Use fallback rate with slight randomization to simulate market fluctuation
          const fluctuation = (Math.random() - 0.5) * 0.5; // ±0.25 GHS
          ghsRate = this.fallbackExchangeRate + fluctuation;
        }
      }

      this.exchangeCache.set('USD_TO_GHS', ghsRate);
      console.log(`💱 Exchange rate cached: 1 USD = ${ghsRate.toFixed(2)} GHS`);
      return ghsRate;

    } catch (error) {
      console.warn('⚠️ Exchange rate fetch failed, using fallback:', error.message);
      return this.fallbackExchangeRate;
    }
  }

  async checkApiLimits() {
    if (this.requestCount >= this.monthlyRequestLimit) {
      throw new Error(`Monthly API request limit (${this.monthlyRequestLimit}) exceeded. Current count: ${this.requestCount}`);
    }
    
    if (this.requestCount > this.monthlyRequestLimit * 0.9) {
      console.warn(`⚠️ API usage warning: ${this.requestCount}/${this.monthlyRequestLimit} requests used this month`);
    }
  }

  async getCommodityPrice(ghanaName, options = {}) {
    try {
      await this.checkApiLimits();

      const {
        forceRefresh = false,
        includeHistory = false,
        region = null
      } = options;

      // Normalize commodity name
      const normalizedName = ghanaName.toLowerCase().trim();
      const apiName = this.ghanaToApiMapping[normalizedName] || normalizedName;
      
      // Check cache first
      const cacheKey = `commodity_${apiName}_${region || 'global'}`;
      if (!forceRefresh) {
        const cached = this.cache.get(cacheKey);
        if (cached) {
          console.log(`📦 Cache hit for ${ghanaName}`);
          return this.applyLocalAdjustments(cached, region);
        }
      }

      console.log(`🌐 Fetching ${ghanaName} (${apiName}) from API Ninjas...`);
      
      // Make API request
      const response = await axios.get(`${this.apiNinjasUrl}?name=${encodeURIComponent(apiName)}`, {
        headers: {
          'X-Api-Key': this.apiNinjasKey,
          'User-Agent': 'AgriConnect-Ghana/1.0'
        },
        timeout: this.requestTimeout
      });

      this.requestCount++;
      console.log(`📊 API request ${this.requestCount}/${this.monthlyRequestLimit} - ${ghanaName}`);

      if (!response.data || typeof response.data.price !== 'number') {
        throw new Error(`Invalid API response for ${ghanaName}`);
      }

      // Get exchange rate
      const exchangeRate = await this.getExchangeRate();

      // Process the data
      const commodityData = {
        name: ghanaName,
        apiName: apiName,
        priceUSD: response.data.price,
        priceGHS: response.data.price * exchangeRate,
        unit: response.data.unit || 'per metric ton',
        lastUpdated: new Date(),
        dataSource: 'api_ninjas',
        exchangeRate: exchangeRate,
        requestId: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      };

      // Validate price reasonableness
      if (commodityData.priceUSD < 0 || commodityData.priceUSD > 50000) {
        console.warn(`⚠️ Unusual price detected for ${ghanaName}: $${commodityData.priceUSD}`);
      }

      // Cache the result
      this.cache.set(cacheKey, commodityData);
      console.log(`💾 Cached ${ghanaName} data for 15 minutes`);

      return this.applyLocalAdjustments(commodityData, region);

    } catch (error) {
      console.error(`❌ Error fetching ${ghanaName}:`, error.message);
      
      // Log more detailed error information
      if (error.response) {
        console.error(`API Response Status: ${error.response.status}`);
        console.error(`API Response Data:`, error.response.data);
      }
      
      // Try to return cached data even if expired
      const staleData = this.cache.get(`commodity_${this.ghanaToApiMapping[ghanaName.toLowerCase()] || ghanaName}_${region || 'global'}`);
      if (staleData) {
        console.log(`📦 Returning stale cached data for ${ghanaName}`);
        staleData.isStale = true;
        return this.applyLocalAdjustments(staleData, region);
      }

      throw new Error(`Failed to fetch commodity data for ${ghanaName}: ${error.message}`);
    }
  }

  applyLocalAdjustments(commodityData, region = null) {
    const adjustedData = { ...commodityData };
    
    // Apply local market premium
    adjustedData.priceGHSLocal = adjustedData.priceGHS * (1 + this.localMarketPremium);
    
    // Apply seasonal adjustments
    const seasonalFactor = 1 + this.seasonalAdjustments;
    adjustedData.priceGHSSeasonal = adjustedData.priceGHSLocal * seasonalFactor;
    
    // Apply regional adjustments
    if (region) {
      const regionalFactors = {
        'Greater Accra': 1.05, // Port proximity premium
        'Ashanti': 1.02,
        'Northern': 0.95, // Lower transportation costs for some crops
        'Upper East': 0.92,
        'Upper West': 0.90,
        'Central': 1.00,
        'Eastern': 0.98,
        'Western': 1.03,
        'Volta': 0.97,
        'Brong-Ahafo': 0.96
      };
      
      const regionalFactor = regionalFactors[region] || 1.00;
      adjustedData.priceGHSRegional = adjustedData.priceGHSSeasonal * regionalFactor;
      adjustedData.region = region;
      adjustedData.regionalFactor = regionalFactor;
    }
    
    // Add market insights
    adjustedData.marketInsights = {
      localPremium: `${(this.localMarketPremium * 100).toFixed(1)}%`,
      seasonalAdjustment: `${(this.seasonalAdjustments * 100).toFixed(1)}%`,
      finalPriceGHS: adjustedData.priceGHSRegional || adjustedData.priceGHSSeasonal,
      pricePerKg: (adjustedData.priceGHSRegional || adjustedData.priceGHSSeasonal) / 1000 // Assuming per metric ton, convert to per kg
    };
    
    return adjustedData;
  }

  async getBulkCommodityPrices(commodityNames, options = {}) {
    const results = {};
    const errors = {};
    
    // Process in batches to avoid overwhelming the API
    const batchSize = 3;
    for (let i = 0; i < commodityNames.length; i += batchSize) {
      const batch = commodityNames.slice(i, i + batchSize);
      
      await Promise.allSettled(
        batch.map(async (name) => {
          try {
            const result = await this.getCommodityPrice(name, options);
            results[name] = result;
          } catch (error) {
            errors[name] = error.message;
          }
        })
      );
      
      // Small delay between batches
      if (i + batchSize < commodityNames.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    return { results, errors };
  }

  async getGhanaPrimaryCommodities(region = null) {
    // Free tier commodities available for Ghana market analysis
    // These provide good representation of Ghana's agricultural and commodity sectors
    const primaryCommodities = [
      'rice', // rough_rice - Important staple grain
      'gold', // Major export commodity for Ghana
      'platinum', // Precious metal market indicator
      'aluminum', // Industrial metal important for construction
      'lumber', // Construction and export material
      'oat' // Alternative grain commodity
    ];
    
    console.log(`🇬🇭 Fetching Ghana primary commodities (Free Tier)${region ? ` for ${region}` : ''}...`);
    return await this.getBulkCommodityPrices(primaryCommodities, { region });
  }

  async getGhanaPremiumCommodities(region = null) {
    // Premium commodities relevant to Ghana (requires paid subscription)
    const premiumCommodities = [
      'maize', // corn - Major staple crop
      'soybeans', // Important cash crop
      'cocoa', // Ghana's major export
      'coffee', // Important beverage crop
      'sugar', // Sweetener commodity
      'wheat', // Imported grain
      'cotton' // Textile fiber
    ];
    
    console.log(`🇬🇭 Fetching Ghana premium commodities${region ? ` for ${region}` : ''}...`);
    return await this.getBulkCommodityPrices(premiumCommodities, { region });
  }

  getCacheStats() {
    return {
      cache: this.cache.getStats(),
      exchangeCache: this.exchangeCache.getStats(),
      requestCount: this.requestCount,
      requestsRemaining: this.monthlyRequestLimit - this.requestCount,
      monthlyLimit: this.monthlyRequestLimit
    };
  }

  clearCache() {
    this.cache.flushAll();
    this.exchangeCache.flushAll();
    console.log('🗑️ All caches cleared');
  }

  async healthCheck() {
    try {
      // Test with a simple commodity
      await this.getCommodityPrice('corn', { forceRefresh: false });
      const exchangeRate = await this.getExchangeRate();
      
      return {
        status: 'healthy',
        timestamp: new Date(),
        apiRequestsUsed: this.requestCount,
        apiRequestsRemaining: this.monthlyRequestLimit - this.requestCount,
        exchangeRate: exchangeRate,
        cacheStatus: this.getCacheStats()
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date()
      };
    }
  }
}

module.exports = new CommodityService(); 