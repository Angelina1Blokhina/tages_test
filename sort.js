/* Разделим файл 1Тб по 100 Мб, чтобы получившиеся части могли поместиться в доступную ОЗУ  и используем сортировку слиянием*/
const fs = require('fs');
const readline = require('readline');
const mergeSort  = require('./mergeSort'); 

const inputFile = 'input.txt'; // Путь к исходному файлу
const outputFile = 'output.txt'; // Путь к выходному файлу

const chunkSize = 1 * 1024 * 1024; // Размер каждой части файла (100 МБ)

function mergeChunks(chunkIndex) {
 
    const mergedData = [];
    const tempFiles = [];
  
    // Чтение отсортированных частей и запись в массив
    for (let i = 0; i <= chunkIndex; i++) {
      const tempFile = `temp_${i}.txt`;
      const data = fs.readFileSync(tempFile, 'utf8').split('\n');
      mergedData.push(...data);
      tempFiles.push(tempFile);
    }
  
    // Сортировка объединенных данных
    const sortedData = mergeSort(mergedData);
  
    // Удаление временных файлов
    tempFiles.forEach(tempFile => fs.unlinkSync(tempFile));
  
    return sortedData;
  }

async function splitAndSortFile() {
    try {
    // Чтение исходного файла построчно
        const fileStream = fs.createReadStream(inputFile);
        const rl = readline.createInterface({
            input: fileStream,
            crlfDelay: Infinity
        });

        let chunkIndex = 0;
        let chunkData = [];

        for await(const line of rl) {
        chunkData.push(line);
        // Если размер накопленных данных превышает размер выделенной памяти для одной части
        if (Buffer.byteLength(chunkData.join('\n')) > chunkSize) {
            // Сортировка данных части
            const sortedChunkData = mergeSort(chunkData);

            // Запись отсортированных данных части во временный файл
            const tempFile = `temp_${chunkIndex}.txt`;
            fs.writeFileSync(tempFile, sortedChunkData.join('\n'));

            chunkIndex++;
            chunkData = [];
        }
        }

        // Обработка оставшихся данных после окончания чтения
        if (chunkData.length > 0) {
        const sortedChunkData = mergeSort(chunkData);
        const tempFile = `temp_${chunkIndex}.txt`;
        fs.writeFileSync(tempFile, sortedChunkData.join('\n'));
        }

        // Объединение отсортированных частей в итоговый файл
        const mergedData = mergeChunks(chunkIndex);
        fs.writeFileSync(outputFile, mergedData.join('\n'));

        console.log('Сортировка завершена.');

    } catch (error) {
        console.error('Произошла ошибка:', error);
  }
}



// Запуск сортировки
splitAndSortFile();
