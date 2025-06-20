# Ghana Commodity Price API Integration

## Overview

This document outlines the comprehensive integration of real-time Ghana commodity pricing using the API Ninjas Commodity Price API. The implementation provides live international commodity prices with Ghana-specific adjustments including local market premiums, seasonal variations, and regional factors.

## 🚀 Features Implemented

### 1. Service Layer Architecture
- **Commodity Service** (`backend/src/services/commodity.service.js`)
  - Intelligent caching system (15-minute TTL for commodity data, 1-hour for exchange rates)
  - Rate limiting with 950 requests/month limit (buffer under API's 1000 limit)
  - Automatic retry logic with exponential backoff
  - Request tracking and monitoring
  - Ghana-specific commodity name mapping

### 2. Currency Conversion
- Real-time USD to Ghana Cedi (GHS) exchange rate fetching
- Fallback exchange rate mechanism (11.50 GHS/USD)
- Automatic currency conversion for all commodity prices
- 1-hour caching for exchange rates

### 3. Ghana Market Adjustments
- **Local Market Premium**: 12% added for transportation and handling
- **Seasonal Adjustments**: Based on Ghana's agricultural calendar
  - Dry season (Nov-Mar): +8% to +15% price increase
  - Rainy season (Apr-Jun): Mixed adjustments (+5% to -2%)
  - Peak rainy season (Jul-Sep): -5% to -8% (harvest time)
  - Post-harvest (Oct): +2%
- **Regional Factors**: Price variations by Ghana region
  - Greater Accra: +5% (port proximity premium)
  - Northern regions: -5% to -10% (lower transportation costs)
  - Other regions: -4% to +3% variation

### 4. Commodity Mapping

#### Free Tier Commodities (Available with free API key)
- Rice → Rough Rice (rough_rice) - Important staple grain
- Gold → Gold (gold) - Major export commodity for Ghana  
- Platinum → Platinum (platinum) - Precious metal market indicator
- Aluminum → Aluminum (aluminum) - Industrial metal for construction
- Lumber → Lumber (lumber) - Construction and export material
- Oat → Oat (oat) - Alternative grain commodity

#### Premium Tier Commodities (Requires paid subscription)
- Maize → Corn (corn) - Major staple crop
- Soybeans → Soybeans (soybean) - Important cash crop
- Cocoa → Cocoa (cocoa) - Ghana's major export
- Coffee → Coffee (coffee) - Important beverage crop
- Sugar → Sugar (sugar) - Sweetener commodity
- Wheat → Wheat (wheat) - Imported grain
- Cotton → Cotton (cotton) - Textile fiber

## 🔌 API Endpoints

### Public Endpoints

#### 1. Get Ghana Commodities
```
GET /api/market/commodities?region={region}&forceRefresh={boolean}&tier={free|premium}
```
Returns real-time prices for Ghana's commodities. 
- **Free Tier** (default): rice, gold, platinum, aluminum, lumber, oat
- **Premium Tier**: maize, soybeans, cocoa, coffee, sugar, wheat, cotton

#### 2. Get Specific Commodity Price
```
GET /api/market/commodities/{commodityName}?region={region}&forceRefresh={boolean}
```
Returns detailed pricing information for a specific commodity.

#### 3. Enhanced Market Overview
```
GET /api/market/enhanced-overview?region={region}
```
Combines local market data with external commodity prices for comprehensive market intelligence.

#### 4. Commodity Service Status
```
GET /api/market/commodity-service/status
```
Returns health status, API usage statistics, and cache performance metrics.

### Protected Endpoints

#### 5. Clear Commodity Cache (Admin Only)
```
POST /api/market/commodity-service/clear-cache
```
Clears all cached commodity and exchange rate data.

## 💾 Data Structure

### Commodity Response Format
```json
{
  "name": "maize",
  "apiName": "corn",
  "priceUSD": 425.50,
  "priceGHS": 4893.25,
  "unit": "per metric ton",
  "lastUpdated": "2024-01-15T10:30:00Z",
  "dataSource": "api_ninjas",
  "exchangeRate": 11.50,
  "marketInsights": {
    "localPremium": "12.0%",
    "seasonalAdjustment": "8.0%",
    "finalPriceGHS": 5552.04,
    "pricePerKg": 5.55
  },
  "region": "Greater Accra",
  "regionalFactor": 1.05
}
```

## 🎯 Frontend Integration

### Market Dashboard Enhancements

The `MarketDashboard.js` component now includes:

1. **Service Status Display**: Shows API usage, exchange rates, and cache performance
2. **External Commodity Section**: Dedicated section for international commodity prices
3. **Enhanced Product Listings**: Displays both local and external data sources
4. **Error Handling**: Shows commodity data issues and service status
5. **Real-time Updates**: Automatic refresh every 15 minutes during business hours

### Key UI Features
- Color-coded indicators for data sources (blue for external, local colors for internal)
- Stale data warnings for cached information
- USD/GHS price display toggle
- Regional price variations
- Local market adjustments breakdown

## ⚙️ Configuration

### Environment Variables
Add to your `.env` file:
```env
# Ghana Commodity Price API Integration
API_NINJAS_KEY=KpBDiLt4QVL8hIVDcQG+zw==drYbwWfjYjK5S1nc
COMMODITY_CACHE_TTL=900
EXCHANGE_RATE_CACHE_TTL=3600
COMMODITY_API_TIMEOUT=10000
COMMODITY_MONTHLY_LIMIT=950
```

### Cache Configuration
- **Commodity Data**: 15 minutes (900 seconds)
- **Exchange Rates**: 1 hour (3600 seconds)
- **Health Checks**: Real-time
- **Cache Cleanup**: Automatic every minute

## 📊 Monitoring & Analytics

### Request Tracking
- Monthly API usage counter with automatic reset
- Warning alerts at 90% usage (855 requests)
- Request deduplication for identical calls
- Failed request logging and fallback mechanisms

### Cache Performance
- Hit/miss ratios tracked and logged
- Cache size monitoring
- Automatic cleanup of expired entries
- Memory usage optimization

### Health Monitoring
- Service availability checks
- API response time tracking
- Exchange rate service monitoring
- Error rate analysis

## 🔒 Security & Rate Limiting

### API Security
- Secure API key storage in environment variables
- Request timeout protection (10 seconds)
- Input validation and sanitization
- CORS policy enforcement

### Rate Limiting
- Monthly request limit enforcement
- Intelligent caching to minimize API calls
- Request batching for bulk operations
- Automatic backoff on rate limit approaching

## 🛠️ Error Handling

### Comprehensive Error Management
1. **Network Failures**: Timeout handling with fallback to cached data
2. **API Rate Limits**: Graceful degradation with user notifications
3. **Invalid Responses**: Data validation and error reporting
4. **Exchange Rate Failures**: Fallback to default rate with fluctuation simulation
5. **Cache Corruption**: Automatic cache invalidation and refresh

### Fallback Mechanisms
- Stale cached data serving during API downtime
- Default exchange rates when conversion fails
- Local data prioritization when external APIs fail
- User-friendly error messages with actionable suggestions

## 🚀 Deployment Considerations

### Production Setup
1. **Environment Configuration**: Set production API keys and limits
2. **Monitoring Setup**: Configure logging and alerting
3. **Cache Warming**: Pre-populate cache with primary commodities
4. **Health Checks**: Regular service availability monitoring
5. **Backup Data**: Maintain fallback commodity prices

### Performance Optimization
- **CDN Integration**: Cache static commodity metadata
- **Database Indexing**: Optimize local market data queries
- **API Batching**: Group similar requests efficiently
- **Memory Management**: Regular cache cleanup and optimization

## 📈 Usage Analytics

### Key Metrics Tracked
- API requests per commodity type
- Cache hit ratios by region
- User engagement with commodity data
- Price volatility alerts triggered
- Regional price comparison usage

### Business Intelligence
- Popular commodity tracking
- Regional market analysis
- Seasonal price pattern analysis
- Market trend identification
- User behavior analytics

## 🎯 Success Metrics

### Technical KPIs
- **Uptime**: 99%+ availability excluding external API downtime
- **Response Time**: <2 seconds for cached data, <10 seconds for fresh data
- **API Usage**: <900 requests/month (staying under limit)
- **Cache Hit Rate**: >80% for commodity data
- **Error Rate**: <5% for all requests

### Business KPIs
- **User Engagement**: Increased time on market intelligence page
- **Data Freshness**: 95%+ of data less than 15 minutes old
- **Regional Coverage**: All 10 Ghana regions supported
- **Commodity Coverage**: 6+ primary commodities always available
- **Price Accuracy**: Within 5% of actual market rates

## 🔧 Maintenance & Updates

### Regular Maintenance Tasks
1. **Monthly API Usage Review**: Check usage patterns and optimize
2. **Exchange Rate Monitoring**: Verify accuracy against bank rates
3. **Cache Performance Tuning**: Adjust TTL based on usage patterns
4. **Commodity Mapping Updates**: Add new commodities as needed
5. **Regional Factor Calibration**: Update based on market conditions

### Future Enhancements
- Historical price trend analysis
- Price prediction algorithms
- Mobile app notifications
- SMS alerts for farmers
- Integration with Ghana commodity exchanges
- Support for additional cryptocurrencies and payment methods

## 📞 Support & Troubleshooting

### Common Issues

1. **High API Usage**: 
   - Solution: Increase cache TTL or implement more aggressive caching
   - Monitor: Check commodity service status endpoint

2. **Stale Exchange Rates**:
   - Solution: Verify exchange rate API availability
   - Fallback: Use manual rate updates during outages

3. **Cache Memory Issues**:
   - Solution: Implement cache size limits and LRU eviction
   - Monitor: Track memory usage patterns

4. **Regional Price Discrepancies**:
   - Solution: Calibrate regional factors based on local market data
   - Update: Seasonal adjustment factors quarterly

### Debug Commands
```bash
# Check commodity service health
curl http://localhost:5001/api/market/commodity-service/status

# Clear cache (admin required)
curl -X POST http://localhost:5001/api/market/commodity-service/clear-cache \
  -H "Authorization: Bearer {admin-token}"

# Test specific commodity
curl "http://localhost:5001/api/market/commodities/maize?region=Greater%20Accra"
```

## 🎉 Conclusion

This comprehensive Ghana Commodity Price API integration provides:
- ✅ **WORKING**: Real-time international commodity pricing (Free Tier)
- ✅ **WORKING**: Ghana-specific market adjustments and currency conversion
- ✅ **WORKING**: Robust caching and error handling
- ✅ **WORKING**: Comprehensive monitoring and analytics
- ✅ **WORKING**: Production-ready deployment architecture
- ✅ **WORKING**: Enhanced user interface with live data
- 🔄 **UPGRADE AVAILABLE**: Premium commodities (maize, cocoa, coffee) with paid subscription

## 🚀 Current Status: **FULLY OPERATIONAL**

The system is successfully fetching live commodity data and displaying it in the Market Intelligence dashboard. Users can now see:

- **Live Gold Prices**: Currently ~$3,370/oz (major Ghana export)
- **Rice Prices**: ~$13.75/contract (important staple)
- **Industrial Metals**: Aluminum, Platinum pricing for market analysis
- **Construction Materials**: Lumber pricing for infrastructure projects
- **Real-time Exchange Rates**: USD to GHS conversion (~10.42 GHS/USD)

### Next Steps for Enhanced Features:
1. **Upgrade to Premium API**: Unlock maize, cocoa, coffee, soybeans (Ghana's key exports)
2. **Historical Data**: Add price trend analysis and forecasting
3. **SMS Alerts**: Implement farmer notification system
4. **Mobile App**: Create dedicated mobile interface

The system successfully bridges international commodity markets with Ghana's local agricultural economy, providing farmers, traders, and market participants with accurate, timely, and locally-relevant pricing information.

For technical support or feature requests, please contact the development team or create an issue in the project repository. 