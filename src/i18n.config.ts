import path from "node:path";
import {I18n} from "i18n";
import * as fs from "node:fs";

const localeDir = path.join(__dirname, 'locales');

// Function to list files in the directory
function listFilesInDirectory(directory: string) {
    console.info('listFilesInDirectory', localeDir)
    fs.readdir(directory, (err, files) => {
        if (err) {
            console.error('Error reading directory:', err);
        } else {
            console.log('Files in directory:', files);
        }
    });
}

// Call the function to list files
listFilesInDirectory(localeDir);

export function initializeI18n() {
    return new I18n({
        autoReload: true,
        locales: ['en', 'de', 'it'],
        header: 'Accept-Language',
        defaultLocale: 'en',
        directory: localeDir,
        objectNotation: true,
       // updateFiles: true,
       // syncFiles: true,
        logWarnFn: function (msg) {
            console.warn('i18n warning:', msg);
        },
        logErrorFn: function (msg) {
            console.error('i18n error:', msg);
        }
    })
}