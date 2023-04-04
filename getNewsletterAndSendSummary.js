// https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit
var SPREADSHEET_ID = '1tkM6J8TkP8S3ihEYPFSd9pJCr9Tyj0pqpTHEhTgv8v0';

function getVariablesFromSheet() {
  var sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('Variables');
  var data = sheet.getDataRange().getValues();
  var variables = {};

  data.forEach(function (row) {
    if (row[0]){
      variables[row[0]] = row[1];
  }});

  return variables;
}

function getEmailRecipientsFromSheet() {
  var sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('Recipients');
  var data = sheet.getDataRange().getValues().slice(1);
  var recipients = {
    newsletterRecipient: [],
    summaryRecipient: []
  };

  data.forEach(function (row) {
    if (row[0] && isValidEmail(row[0])) {
      recipients.newsletterRecipient.push(row[0]);
    }
    if (row[1] && isValidEmail(row[1])) {
      recipients.summaryRecipient.push(row[1]);
    }
  });

  return recipients;
}

function isValidEmail(email) {
  var regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return regex.test(email);
}

function getEmailsAndSaveToTextFile() {
  var variables = getVariablesFromSheet();
  var allSummaries = '';
  var recipients = getEmailRecipientsFromSheet();
  
  recipients.newsletterRecipient.forEach(function (recipient) {
    var folderId = variables.folderId;
    var folder = DriveApp.getFolderById(folderId);
    var today = new Date();
    var oneDay = 24 * 60 * 60 * 1000;
    var yesterday = new Date(today.getTime() - oneDay);
    var searchQuery = 'to:' + recipient + ' after:' + Utilities.formatDate(yesterday, Session.getScriptTimeZone(), 'yyyy/MM/dd');
    var threads = GmailApp.search(searchQuery);

    if (threads.length === 0) {
      return;
    }

    var currentTokenCount = 0;
    var emailText = '';
    var fileCount = 1;

    for (var i = 0; i < threads.length; i++) {
      var messages = threads[i].getMessages();

      for (var j = 0; j < messages.length; j++) {
        var message = messages[j];
        var subject = message.getSubject();
        var sender = message.getFrom();
        var date = message.getDate();
        var body = message.getPlainBody();
        body = removeLinks(body);
        var formattedMessage = 'Betreff: ' + subject + '\n' +
                               'Absender: ' + sender + '\n' +
                               'Datum: ' + date + '\n\n' +
                               body + '\n' +
                               '----------------------------------------\n\n';

        var newEmailText = emailText + formattedMessage;
        var newTokenCount = getTokenCount(newEmailText);

        if (newTokenCount > 4096) {
            var dateString = Utilities.formatDate(today, Session.getScriptTimeZone(), 'yyyy-MM-dd');
            var fileName = 'Emails_' + recipient + '_' + dateString + '_File_' + fileCount + '.txt';
            var createdFile = folder.createFile(fileName, emailText);
            
            var summary = sendFileToOpenAiApi(createdFile.getId());
            allSummaries += summary + '\n\n----------------------------------------\n\n'; 
  
            emailText = formattedMessage;
            currentTokenCount = getTokenCount(emailText);
            fileCount++;
          } else {
            emailText = newEmailText;
            currentTokenCount = newTokenCount;
          }
        }
      }
  
      if (emailText) {
        var dateString = Utilities.formatDate(today, Session.getScriptTimeZone(), 'yyyy-MM-dd');
        var fileName = 'Emails_' + recipient + '_' + dateString + '_File_' + fileCount + '.txt';
        var createdFile = folder.createFile(fileName, emailText);
        
        var summary = sendFileToOpenAiApi(createdFile.getId());
        allSummaries += summary + '\n\n----------------------------------------\n\n'; 
      }
    });
    
    if (allSummaries) {
      sendEmail(allSummaries, recipients.summaryRecipient);
    }
  }
  
  function getTokenCount(text) {
    return Math.ceil(text.length / 4);
  }
  
  function removeLinks(text) {
    return text.replace(/(?:https?|ftp):\/\/[\n\S]+/g, '');
  }
  
  function sendFileToOpenAiApi(fileId) {
    var file = DriveApp.getFileById(fileId);
    var fileContent = file.getBlob().getDataAsString();
    var openAiApiKey = getVariablesFromSheet().openAiApiKey;
    var url = 'https://api.openai.com/v1/chat/completions';
    var data = {
      'model': 'gpt-3.5-turbo',
      'messages': [
        {'role': 'system', 'content': 'Du bist ein Experte für Künstliche Inteligenz und fasst die Newsletter so zusammen, dass man am Ende genug Informationen hat.'},
        {'role': 'user', 'content': 'Fasse diese Newsletter zusammen: ' + fileContent}
      ],
      'temperature': 0.7
    };
  
    var options = {
      'method': 'post',
      'contentType': 'application/json',
      'headers': {
        'Authorization': 'Bearer ' + openAiApiKey
      },
      'payload': JSON.stringify(data)
    };
  
    var response = UrlFetchApp.fetch(url, options);
    var jsonResponse = JSON.parse(response.getContentText());
    var summary = jsonResponse.choices[0].message.content;
  
    return summary;
  }
  
  function sendEmail(summary, summaryRecipient) {
    var subject = "Daily Ai-News";
    var body = 'Hallo :),\n hier ist sind deine täglichen Ai-News\n Grüße und schönen Tag\n J.A.R.V.I.S\n\n' + summary;
  
    summaryRecipient.forEach(function (recipient) {
      GmailApp.sendEmail(recipient, subject, body);
    });
  }
  
  function main() {
    getEmailsAndSaveToTextFile();
  }
  
  main();
  
