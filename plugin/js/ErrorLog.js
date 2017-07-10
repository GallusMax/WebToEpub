"use strict";

class ErrorLog {
    constructor() {
    }

    static log(error) {
        ErrorLog.showErrorMessage(error);
    }

    static showErrorMessage(msg) {
        // if already showing an error message, queue the new one to display
        // when currently showing is closed.
        ErrorLog.queue = [msg].concat(ErrorLog.queue);
        if (1 < ErrorLog.queue.length) {
            return;
        };

        let sections = ErrorLog.hideAllSectionsSavingVisibility();
        ErrorLog.getErrorSection().hidden = false;

        ErrorLog.setErrorMessageText(msg);
        document.getElementById("errorButtonOk").onclick = function () {
            ErrorLog.queue.pop();
            if (ErrorLog.queue.length === 0) {
                ErrorLog.restoreSectionVisibility(sections);
            } else {
                ErrorLog.setErrorMessageText(ErrorLog.queue[ErrorLog.queue.length - 1]);
            };
        };
    }

    static dumpHistoryToFile() {
        if (ErrorLog.history.length === 0) {
            ErrorLog.showErrorMessage(chrome.i18n.getMessage("warningNoErrorsToWrite"));
        } else {
            let errors = ErrorLog.history.reduce((p, c) => p += c + "\r\n\r\n", "");
            let blob = new Blob([errors], {type : "text"});
            try {
                Download.save(blob, "WebToEpub.Errors.txt")
            } catch (err) {
                ErrorLog.showErrorMessage(err);
            }
            ErrorLog.history = [];
        }
    }

    /** private */
    static getErrorSection() {
        return document.getElementById("errorSection");
    }

    /** private */
    static hideAllSectionsSavingVisibility() {
        let sections = new Map();
        for(let section of util.getElements(document, "section")) {
            sections.set(section, section.hidden);
            section.hidden = true;
        };
        return sections;
    }

    /** private */
    static setErrorMessageText(msg) {
        let textRow = document.getElementById("errorMessageText");
        if (typeof (msg) === "string") {
            textRow.textContent = msg ;
        } else {
            // assume msg is some sort of error object
            textRow.textContent = msg.message + " " + msg.stack;
        }
        ErrorLog.history.push(textRow.textContent);
    }

    /** private */
    static restoreSectionVisibility(sections) {
        for(let [key,value] of sections) {
            key.hidden = value;
        };
    }
}

ErrorLog.queue = [];
ErrorLog.history = [];