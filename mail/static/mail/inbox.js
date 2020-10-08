document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', () => compose_email('compose'));

  load_mailbox('inbox');

  document.querySelector('#compose-form').addEventListener('submit', () => {

    fetch('/emails', {
      method: 'POST',
      body: JSON.stringify({
        recipients:  document.querySelector('#compose-recipients').value,
        subject: document.querySelector('#compose-subject').value,
        body: document.querySelector('#compose-body').value
      })
    })
    .then(response => response.json())
    .then(result => {
    // Print result
      console.log(result);
    });

    event.preventDefault();
    setTimeout(() => { load_mailbox('sent');}, 100);
  });

});

function compose_email(mailType) {


      // Show compose view and hide other views
  document.querySelector('#mailList').style.display = 'none';
  document.querySelector('#readMail').style.display = 'none';
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  if (mailType == 'compose') {
    // Clear out composition fields
    document.querySelector('#compose-recipients').value = '';
    document.querySelector('#compose-subject').value = '';
    document.querySelector('#compose-body').value = '';
  }

  else {
    fetch(`/emails/${mailType}`)
    .then(response => response.json())
    .then(email => {
    console.log(email);
    document.querySelector('#compose-recipients').value = email.sender;

    if (email.subject.startsWith('Re')) {
      document.querySelector('#compose-subject').value = email.subject;
    }
    else {
      document.querySelector('#compose-subject').value = `Re:${email.subject}`;
    }
    
    document.querySelector('#compose-body').value = `On [${email.timestamp}] ${email.sender} wrote: \n\n${email.body} \n\n`;
  });
  }
}

function load_mailbox(mailbox) {
  requestMethod = 'GET'
  // Show the mailbox and hide other views

  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#readMail').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#mailList').style.display = 'block';

  var table = document.getElementById("mailList");
  for(var i = table.rows.length - 1; i >= 0; i--) {
    table.deleteRow(i);
  }

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
    emails.forEach(function(email) {
      var table = document.getElementById("mailList");
      var row = table.insertRow(0);
  
      var cell1 = row.insertCell(0);
      var cell2 = row.insertCell(1);
      var cell3 = row.insertCell(2);
      var cell4 = row.insertCell(3);

      var archiveButton = document.createElement('button');
      archiveButton.innerHTML = 'Archive';
      archiveButton.class = "btn btn-sm btn-outline-primary";
      archiveButton.id = 'archiveButton';

      cell1.id = 'sentTo';
      cell2.id = 'subject';
      cell3.id = 'datetime';
      cell4.id = 'archiveButton';

      var a = document.createElement('a');
      var link = document.createTextNode(email.subject);  
      a.appendChild(link);  
      a.title = email.subject;
      a.href = `javascript:load_mail(${email.id})`;

      cell1.innerHTML = email.recipients;
      cell2.appendChild(a)
      cell3.innerHTML = email.timestamp;

      if (mailbox === 'inbox'){
        cell4.appendChild(archiveButton)
        
        document.querySelector('#archiveButton').addEventListener('click', () => {
          fetch(`/emails/${email.id}`, {
            method: 'PUT',
            body: JSON.stringify({
                archived: true
            })
          })
          setTimeout(() => { load_mailbox('inbox');}, 100);
        });
      }

      else if(mailbox === 'archive'){
        archiveButton.innerHTML = 'Unarchive';
        cell4.appendChild(archiveButton)

        document.querySelector('#archiveButton').addEventListener('click', () => {
          fetch(`/emails/${email.id}`, {
            method: 'PUT',
            body: JSON.stringify({
                archived: false
            })
          })
          setTimeout(() => { load_mailbox('inbox');}, 100);
        });
      }


      if (email.read == true) {
        document.querySelector('#mailList tr').style.backgroundColor = 'rgb(230, 230, 230)';
      }
    });
  })

}

function load_mail(mail) {
  requestMethod = 'GET'

  document.querySelector('#mailList').style.display = 'none';
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#readMail').style.display = 'block';

  fetch(`/emails/${mail}`, {
    method: 'PUT',
    body: JSON.stringify({
        read: true
    })
  })

  fetch(`/emails/${mail}`)
  .then(response => response.json())
  .then(email => {
  console.log(email);
  document.querySelector('#readMail').innerHTML = 
    `<li><span id='bold'> From:</span> ${email.sender}</li>
     <li><span id='bold'> To:</span> ${email.recipients}</li>
     <li><span id='bold'> Subject:</span> ${email.subject}</li>
     <li><span id='bold'> Timestamp:</span> ${email.timestamp}</li>
     <button class="btn btn-sm btn-outline-primary" onclick=compose_email(${mail}) id="reply">Reply</button>
     <hr>
     <li> ${email.body}</li>`;
  });
}
