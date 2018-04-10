# CSV Parser
Flexible Node.js module to parse CSV data.

### Asynchronous Version
Use `parse_csv(csv_data, row_handler)` to process your data asynchronously with Node streams. The second argument is a higher order function that is called on each row of CSV data. The function you pass in is responsible for whatever you'd like to do with each row. A typical use case would be processing or validating each row and sending it to a separate Node output stream.

For example:
```
var fs = require('fs');
var csv = require('./csv.js');

var read_stream = fs.createReadStream(videos_filepath).setEncoding('ascii');
var write_stream = fs.createWriteStream('./output.csv', {flags: 'a', defaultEncoding: 'ascii'});

read_stream.on('data', function(data) {
    csv.end_of_file = false;
    csv.parse_csv(data, handle_row);
});

function handle_row(row) {
  // process each row here
  // and send to output stream
  csv.output_to_csv(row, write_stream);
}


```
### Synchronous Version
Use `parse_csv_sync (csv_data)` to process your data synchronously. This function returns an array to the caller containing an array for each row in the format:  [[value1,value2], [value1,value2], [value1,value2], ...]. Not recommended for very large datasets.

```
var fs = require('fs');
var csv = require('./csv.js');
var your_csv_data = fs.readFileSync(path_to_csv).toString();
var arr = csv.parse_csv_sync(your_csv_data);
```
