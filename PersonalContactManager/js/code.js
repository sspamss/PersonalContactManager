const urlBase = 'http://contactasaurus.com/LAMPAPI';
const extension = 'php';

let userId = 0;
let firstName = "";
let lastName = "";

const contactIds = [];

function doLogin()
{
	userId = 0;
	firstName = "";
	lastName = "";
	
	let login = document.getElementById("userName").value;
	let password = document.getElementById("password").value;
    var hash = md5(password); 

    var passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,})/;

    if (userName == "" || password == "") 
    {
      document.getElementById("loginResult").innerHTML = "Please fill in all fields.";
      return;
    } 
	
	document.getElementById("loginResult").innerHTML = "";

	let tmp = 
    {
        login: login,
        password: hash
    };

	let jsonPayload = JSON.stringify( tmp );
	let url = urlBase + '/Login.' + extension;

	let xhr = new XMLHttpRequest();
	xhr.open("POST", url, true);

	xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
	try
	{
		xhr.onreadystatechange = function() 
		{
			if (this.readyState == 4 && this.status == 200) 
			{
				let jsonObject = JSON.parse(xhr.responseText);
				userId = jsonObject.id;
		
				if (userId < 1)
				{		
					document.getElementById("loginResult").innerHTML = "User/Password combination incorrect";
					return;
				}
		
				firstName = jsonObject.firstName;
				lastName = jsonObject.lastName;

				saveCookie();
				window.location.href = "contacts.html";
			}
		};
		xhr.send(jsonPayload);
	}
	catch(err)
	{
		document.getElementById("loginResult").innerHTML = err.message;
	}

}

function registerUser()
{
    firstName = document.getElementById("firstName").value;
    lastName = document.getElementById("lastName").value;

    let username = document.getElementById("userName").value;
    let password = document.getElementById("password").value;

    if (username == "" || password == "") 
    {
        document.getElementById("signupResult").innerHTML = "Please fill in all fields.";
        return;
    } 

    var hash = md5(password);

    document.getElementById("signupResult").innerHTML = "";

    let tmp = 
    {
        firstName: firstName,
        lastName: lastName,
        login: username,
        password: hash 
    };

    let jsonPayload = JSON.stringify(tmp);

    let url = urlBase + '/Register.' + extension;
    let xhr = new XMLHttpRequest();

    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");

    try 
    {
        xhr.onreadystatechange = function () 
        {
            if (this.readyState != 4)
            {
                return;
            }

            if (this.status == 409) 
            {
                document.getElementById("signupResult").innerHTML = "User already exists";
                return;
            }

            if (this.status == 200) 
            {

                let jsonObject = JSON.parse(xhr.responseText);
                userId = jsonObject.id;
                document.getElementById("signupResult").innerHTML = "User added";
                firstName = jsonObject.firstName;
                lastName = jsonObject.lastName;
                saveCookie();
                window.location.href = "login.html";
            }
           
        };

        xhr.send(jsonPayload);
    } 
    catch (err) 
    {
        document.getElementById("signupResult").innerHTML = err.message;
    }
}

function saveCookie() 
{
    let minutes = 20;
    let date = new Date();
    date.setTime(date.getTime() + (minutes * 60 * 1000));

    document.cookie = "firstName=" + firstName + ",lastName=" + lastName + ",userId=" + userId + ";expires=" + date.toGMTString();
}

function readCookie()
{
	userId = -1;
	let data = document.cookie;
	let splits = data.split(",");
	for(var i = 0; i < splits.length; i++) 
	{
		let thisOne = splits[i].trim();
		let tokens = thisOne.split("=");
		if (tokens[0] == "firstName")
		{
			firstName = tokens[1];
		}
		else if (tokens[0] == "lastName")
		{
			lastName = tokens[1];
		}
		else if(tokens[0] == "userId")
		{
			userId = parseInt(tokens[1].trim());
		}
	}
	
	if (userId < 0)
	{
		window.location.href = "index.html";
	}
	else
	{
		document.getElementById("userName").innerHTML = firstName + " " + lastName;
	}

}


function doLogout() 
{
    userId = 0;
    firstName = "";
    lastName = "";

    document.cookie = "firstName= ; expires = Thu, 01 Jan 1970 00:00:00 GMT";
    window.location.href = "index.html";
}

function addContact()
{
    let firstname = document.getElementById("firstNameTable").value;
    let lastname = document.getElementById("lastNameTable").value;
    let phonenumber = document.getElementById("phoneNumber").value;
    let emailaddress = document.getElementById("emailTable").value;

    if(validateContact(firstname, lastname, phonenumber, emailaddress) == true){

        let tmp = 
        {
            firstName: firstname,
            lastName: lastname,
            phoneNumber: phonenumber,
            emailAddress: emailaddress,
            userId: userId
        };

        let jsonPayload = JSON.stringify(tmp);

        let url = urlBase + '/CreateContacts.' + extension;

        let xhr = new XMLHttpRequest();
        xhr.open("POST", url, true);
        xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");

        try
        {
            xhr.onreadystatechange = function () 
            {
                if (this.readyState != 4)
                {
                    return;
                }

                if (this.status == 200) 
                {
                    document.getElementById("tableContacts").reset();
                    document.getElementById("contactAdded").innerHTML = "User added";
                    loadContacts();
                }
            };
            xhr.send(jsonPayload);
        }
        catch(err)
        {
            document.getElementById("contactResult").innerHTML = err.message;
        }
    }
}

function loadContacts() 
{
    let tmp = 
    {
        search: "",
        userId: userId
    };

    let jsonPayload = JSON.stringify(tmp);

    let url = urlBase + '/SearchContacts.' + extension;
    let xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");

    try {
        xhr.onreadystatechange = function () 
        {
            if (this.readyState != 4)
            {
                return;
            }
            
            if (this.status == 200) 
            {
                let jsonObject = JSON.parse(xhr.responseText);

                if (jsonObject.error)
                {
                    console.log(jsonObject.error);
                    return;
                }

                let insertTable = "<table>"

                for (let i = 0; i < jsonObject.results.length; i++)
                {
                    contactIds[i] = jsonObject.results[i].ID

                    insertTable += "<tr id='row" + i + "'>"
                    insertTable += "<td style='text-align:center;font-family:'Karla'' id='table-first-name" + i + "'><span>" + jsonObject.results[i].FirstName + "</span></td>";
                    insertTable += "<td style='text-align:center;font-family:'Karla'' id='table-last-name" + i + "'><span>" + jsonObject.results[i].LastName + "</span></td>";
                    insertTable += "<td style='text-align:center;font-family:'Karla'' id='table-email" + i + "'><span>" + jsonObject.results[i].EmailAddress + "</span></td>";
                    insertTable += "<td style='text-align:center;font-family:'Karla'' id='table-phone" + i + "'><span>" + jsonObject.results[i].PhoneNumber + "</span></td>";
                    insertTable += 
                        "<td style='display:block;margin:auto;text-align:center'>" +
                            "<button type='button' style='height:35px;width:35px' id='edit_button" + i +"' onclick='editContact(" + i + ")'>" + "<span style='align-items:left' class='fa fa-edit'></span>" + "</button>" +
                            "<button type='button' style='height:35px;width:35px' id='save_button" + i +"' value='Save' onclick='saveUpdate(" + i + ")'>" + "<span style='align-items:left' class='fa-solid fa-check'></span>" + "</button>" + 
                            "<button type='button' style='height:35px;width:35px' id='delete_button' onclick='deleteContact(" + i + ")'>" + "<span style='align-items:center' class='fa-solid fa-delete-left'></span>" + "</button>" + 
                        "</td>";
                    insertTable += "<tr/>"

                }
                insertTable += "</table>"
                document.getElementById("tableInformation").innerHTML = insertTable;
            }
        };
        xhr.send(jsonPayload);
    } 
    catch (err) 
    {
        console.log(err.message);
    }
}

function deleteContact(contactId)
{
    let fn = document.getElementById("table-first-name" + contactId).innerText;
    let ln = document.getElementById("table-last-name" + contactId).innerText;

    let check = confirm('Are you sure you want to delete this contact?');
    if (check === true) 
    {
        document.getElementById("row" + contactId + "").outerHTML = "";
        let tmp = 
        {
            firstName: fn,
            lastName: ln,
            userId: userId
        };

        let jsonPayload = JSON.stringify(tmp);

        let url = urlBase + '/DeleteContacts.' + extension;

        let xhr = new XMLHttpRequest();
        xhr.open("POST", url, true);
        xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
        try 
        {
            xhr.onreadystatechange = function () 
            {
                if (this.readyState != 4)
                {
                    return;
                }

                if (this.status == 200) 
                {
                    loadContacts();
                }
            };
            xhr.send(jsonPayload);
        }
        catch (err) 
        {
            console.log(err.message);
        }

    };


}


function editContact(contactId)
{
    document.getElementById("edit_button" + contactId).disabled = true;

    let first = document.getElementById("table-first-name" + contactId);
    let last = document.getElementById("table-last-name" + contactId);
    let email = document.getElementById("table-email" + contactId);
    let phone = document.getElementById("table-phone" + contactId);

    first.innerHTML = "<input type='text' id='new-first" + contactId + "' value='" + first.innerText + "'>";
    last.innerHTML = "<input type='text' id='new-last" + contactId + "' value='" + last.innerText + "'>";
    email.innerHTML = "<input type='text' id='new-email" + contactId + "' value='" + email.innerText + "'>";
    phone.innerHTML = "<input type='text' id='new-phone" + contactId + "' value='" + phone.innerText + "'>"
    
}

function saveUpdate(contactId)
{ 
    let updatedFirst = document.getElementById("new-first" + contactId).value;
    let updatedLast = document.getElementById("new-last"  + contactId).value;
    let updatedPhone = document.getElementById("new-phone"  + contactId).value;
    let updatedEmail = document.getElementById("new-email"  + contactId).value;

    let updatedId = contactIds[contactId]

    document.getElementById("table-first-name" + contactId).innerHTML = updatedFirst;
    document.getElementById("table-last-name" + contactId).innerHTML = updatedLast;
    document.getElementById("table-email" + contactId).innerHTML = updatedEmail;
    document.getElementById("table-phone" + contactId).innerHTML = updatedPhone;
    

    let tmp = 
    {
        newFirstName: updatedFirst,
        newLastName: updatedLast,
        newPhoneNumber: updatedPhone,
        newEmailAddress: updatedEmail,
        id: updatedId
    };

    let jsonPayload = JSON.stringify(tmp);

    let url = urlBase + '/UpdateContacts.' + extension;

    let xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
    try 
    {
        xhr.onreadystatechange = function () 
        {
            if (this.readyState != 4)
            {
                return;
            }

            if (this.status == 200) 
            {
                loadContacts();
            }
        };
        xhr.send(jsonPayload);
    } 
    catch (err) 
    {
        console.log(err.message);
    }
}

function validateContact(firstname, lastname, phonenumber, emailaddress){

    let phoneRGEX = /^[(]{0,1}[0-9]{3}[)]{0,1}[-\s\.]{0,1}[0-9]{3}[-\s\.]{0,1}[0-9]{4}$/;
    let emailRGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

    let phoneResult = phoneRGEX.test(phonenumber);
    let emailResult = emailRGEX.test(emailaddress);

    if(firstname == "")
    {
        document.getElementById("contactAdded").innerHTML = "Please enter a first name";
        return false;
    }

    if(lastname == "")
    {
        document.getElementById("contactAdded").innerHTML = "Please enter a last name";
        return false;
    }

    if(emailResult == false)
    {
      document.getElementById("contactAdded").innerHTML = "Please enter a valid email address";
      return false;
    }

    if(phoneResult == false)
    {
      document.getElementById("contactAdded").innerHTML = "Please enter a valid phone number";
      return false;
    }
  

  
    return true;
  }