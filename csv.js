const EventEmitter = require('events');
module.exports = function()
{
    this.buffers = {
        char_buffer: '',
        current_row: [],
        end_of_file: false
    }

    function parse_csv (csv_data, row_handler) {
        // second parameter is a higher order function for processing on each row
        // ignores commas that are part of a quoted string
        let is_open_quote = false;
        for (let i = 0; i < csv_data.length; i++) {
            let current_char = csv_data.charAt(i);
            if (current_char == '"'){
                is_open_quote = !is_open_quote;
            }
            else if (current_char !== ',' && current_char != '\n' && current_char != '\r'){
                buffers.char_buffer += current_char;
            }
            else if (current_char === ',' && !is_open_quote) {
                buffers.current_row.push(buffers.char_buffer);
                buffers.char_buffer = '';
            }
            else if (current_char == '\r' && !is_open_quote) {
                row_emitter.emit('end_of_row', buffers, row_handler);
            }
        }
        // row_emitter.emit('end_of_row', buffers, row_handler);
    }

    function parse_csv_sync (csv_data) {
        // SYNCHRONOUS VERSION -- this returns an array to the caller containing
        // an array for each row
        // e.g. [[value1,value2], [value1,value2], [value1,value2], ...]

        let buffer = '';
        let current_row = [];
        let data_array = [];
        let is_open_quote = false;
        for (let i = 0; i < csv_data.length; i++) {
            let current_char = csv_data.charAt(i);
            if (current_char == '"'){
                is_open_quote = !is_open_quote;
            }
            else if (current_char !== ',' && current_char != '\n' && current_char != '\r'){
                buffer += current_char;
            }
            else if (current_char === ',' && !is_open_quote) {
                current_row.push(buffer);
                buffer = '';
            }
            else if (current_char == '\r' && !is_open_quote) {
                current_row.push(buffer);
                data_array.push(current_row);
                current_row = [];
                buffer = '';
            }
        }

        if (buffer != ''){
            current_row.push(buffer);
            data_array.push(current_row);
            current_row = [];
            buffer = '';
        }
        return data_array;
    }

    class RowEmitter extends EventEmitter {}
    const row_emitter = new RowEmitter();

    row_emitter.on('end_of_row', function(buffers, row_handler) {
      buffers.current_row.push(buffers.char_buffer);
      if (typeof row_handler === 'function') {
          row_handler(buffers.current_row)
      }
      initialize_csv_buffers();
    });

    row_emitter.on('end_of_file', function(buffers, row_handler) {
      if (typeof row_handler === 'function') {
          row_handler(buffers.current_row)
      }
      buffers.current_row.push(buffers.char_buffer);
      if (buffers.store_as_array) {
          buffers.array.push(buffers.current_row);
      }
      initialize_csv_buffers();
    });

    function output_to_csv (data, csv_write_stream) {
        // accepts single values or arrays of values
        let write_buffer = '';

        if (!Array.isArray(data)){
            write_buffer = data;
        }
        else {
            for (let i = 0; i < data.length; i++) {
                if (data[i].toString().includes(',')) {
                    write_buffer += '\"' + data[i] + '\"';
                }
                else {
                    write_buffer += data[i].toString();
                    if (i !== data.length) {
                        write_buffer +=  ',';
                    }
                }
            }
        }

        write_buffer += '\r\n';
        csv_write_stream.write(write_buffer);
    }

    function initialize_csv_buffers() {
        // call this before creating a new read stream
        this.buffers.char_buffer = '';
        this.buffers.current_row = [];
        this.buffers.end_of_file = false;
    }

    return {
        initialize_csv_buffers: initialize_csv_buffers,
        parse_csv: parse_csv,
        parse_csv_sync: parse_csv_sync,
        output_to_csv: output_to_csv,
        end_of_file: buffers.end_of_file,
        row_emitter: row_emitter,
        buffers: buffers
    };
}();
