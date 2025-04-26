# StockTracker

StockTrackr is a simple and intuitive stock trading app that helps users track their investments and calculate gains or losses using FIFO (First In, First Out) or LIFO (Last In, First Out) methods. Users can log buy and sell trades, monitor portfolio performance. With a clean interface and easy-to-use features, StockTrackr is perfect for casual investors or anyone wanting better insight into their stock trading performance. Make smarter sell decisions with accurate, method-based trade tracking.

# How to Run

Follow the steps to run this:
1. Install Dependencies using "npm install".
2. Set MongoDB URI in .env file.
3. Go to terminal and run "node ./api/index.js" to run the application.

# APIs

This application has 2 controllers for trades and lots operations.

1. Add a New Trade
POST /addtrade
Adds a new trade.
Body: { stockSymbol, quantity, price, type, date, method }

2. Update an Existing Trade
PUT /updatetrade
Updates a trade by trade_id.
Body: { trade_id, updates... }

3. Get a Single Trade
POST /gettrade
Retrieves one trade by trade_id.
Body: { trade_id }

4. Get All Trades
GET /getalltrades
Returns a list of all recorded trades.

5. Delete a Trade
DELETE /deletetrade/:id
Deletes a trade by trade_id.

6. Bulk Trade Operation
POST /bulktrade
Upload multiple trades at once.
Body: [{ trade1 }, { trade2 }, ...]

7. Sell Stocks Using FIFO
POST /sell/fifo
Sells stock using the FIFO (First In, First Out) method.
Body: { stockSymbol, quantity, date }

8. Sell Stocks Using LIFO
POST /sell/lifo
Sells stock using the LIFO (Last In, First Out) method.
Body: { stockSymbol, quantity, date }

9. Get Specific Lot by ID
GET /getlot/:lot_id
Retrieves detailed info about a specific lot.

10. Get All Lots for a Stock
GET /getlots?stockSymbol=AAPL
Lists all open and closed lots for the given stock.

