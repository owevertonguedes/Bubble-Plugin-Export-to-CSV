function(properties, context) {
    // Lista dos meses abreviados para completos
    const monthNames = {
        'Jan': 'January', 'Feb': 'February', 'Mar': 'March', 'Apr': 'April',
        'May': 'May', 'Jun': 'June', 'Jul': 'July', 'Aug': 'August',
        'Sep': 'September', 'Oct': 'October', 'Nov': 'November', 'Dec': 'December'
    };

    // Função auxiliar para converter datas para o formato YYYY-MM-DD HH:MM:SS
    function convertDateFormat(dateStr) {
        const regex = /(\w{3}) (\d{1,2}), (\d{4}) (\d{1,2}):(\d{2}) ([ap]m)/;
        const match = dateStr.match(regex);
        if (match) {
            let [ , month, day, year, hour, minute, period] = match;
            month = monthNames[month]; // Converte mês abreviado para completo
            if (period === 'pm' && hour !== '12') {
                hour = parseInt(hour) + 12; // Conversão para formato de 24 horas
            } else if (period === 'am' && hour === '12') {
                hour = '00'; // Meia-noite no formato 24 horas
            }
            day = day.padStart(2, '0'); // Garantindo dois dígitos para o dia
            hour = hour.toString().padStart(2, '0'); // Garantindo dois dígitos para a hora
            minute = minute.padStart(2, '0'); // Garantindo dois dígitos para os minutos
            return `${year}-${month}-${day} ${hour}:${minute}:00`; // Formato final ISO 8601
        }
        return dateStr; // Retorna original se não corresponder ao formato esperado
    }

    const rawData = properties.tableData;
    const fileName = properties.fileName || 'export.csv';  // Nome padrão do arquivo se não fornecido

    const dataPattern = /(\w+)\=\((.*?)\)(,|$)/g;
    let match;
    const columnNames = [];
    const dataColumns = {};

    while (match = dataPattern.exec(rawData)) {
        const columnName = match[1];
        let data = match[2].split(',').map(item => {
            return item.replace(/\$comma/g, ',').trim();  // Substitui $comma por vírgula real
        });
        columnNames.push(columnName);
        dataColumns[columnName] = data;
    }

    let csvContent = "data:text/csv;charset=utf-8," + columnNames.join(",") + "\r\n";

    const numRows = dataColumns[columnNames[0]].length;

    for (let i = 0; i < numRows; i++) {
        let row = columnNames.map(columnName => {
            let cell = dataColumns[columnName][i];
            if (cell.match(/\d{1,2}\s[a-zA-Z]{3}\s\d{4}/)) {
                cell = convertDateFormat(cell);  // Converte datas encontradas
            }
            return '"' + cell + '"';  
        });
        csvContent += row.join(",") + "\r\n";
    }

    var encodedUri = encodeURI(csvContent);
    var link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
