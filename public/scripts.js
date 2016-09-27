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

function verifyLoginSubmit() {
    if(document.getElementById("username-field").value == "") {
	return displayFormError("Please enter your username");
    } else if (document.getElementById("password-field").value == "") {
	return displayFormError("Please enter your password");
    } else {
	return true;
    }
}

function displayFormError(message) {
    document.getElementById("message").innerHTML = message;
    return false;
}
