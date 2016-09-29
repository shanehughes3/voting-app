
function displayFormError(message) {
    document.getElementById("message").innerHTML = message;
    return false;
}

// REGISTRATION
function verifyRegisterSubmit() {
    if (document.getElementById("username-field").value == "") {
	return displayFormError("Please enter a username");
    } else if (document.getElementById("password-field").value.length < 8) {
	return displayFormError("Passwords must be at least 8 characters");
    } else if (document.getElementById("password-field").value !==
	       document.getElementById("verify-field").value) {
	return displayFormError("Passwords do not match");
    } else {
	return true;
    }
}

// LOGIN
function verifyLoginSubmit() {
    if(document.getElementById("username-field").value == "") {
	return displayFormError("Please enter your username");
    } else if (document.getElementById("password-field").value == "") {
	return displayFormError("Please enter your password");
    } else {
	return true;
    }
}

// POLL CREATION
function addCreateField() {
    var newField = document.getElementById("model-create-field")
	.cloneNode(true);
    newField.lastChild.value = "";
    document.getElementById("options-container").appendChild(newField);
}

function verifyNewPollSubmit() {
    // allows submission with no options, since voters can
    // add their own later
    // empty options cleaned out on backend
    if (document.getElementById("question-field").value == "") {
	return displayFormError("Your poll must have a question");
    }
    return true;
}

// VOTING
function verifyVoteCompletion() {
    return true;
}
