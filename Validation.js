const form = document.querySelector('form');
const firstname_input = document.getElementById('firstname-input');
const email_input = document.getElementById('email-input');
const password_input = document.getElementById('password-input');
const repeat_password_input = document.getElementById('repeat-password-input');
const error_message = document.getElementById('error-message');

form.addEventListener('submit', (e) => {
    let errors = [];

    // Clear previous error highlights
    document.querySelectorAll('.incorrect').forEach(div => div.classList.remove('incorrect'));
    error_message.innerText = '';

    // If there's a firstname input, we’re on the signup page
    if (firstname_input) {
        errors = getSignupFormErrors(
            firstname_input.value,
            email_input.value,
            password_input.value,
            repeat_password_input.value
        );
    } else {
        errors = getLoginFormErrors(email_input.value, password_input.value);
    }

    if (errors.length > 0) {
        e.preventDefault();
        error_message.innerText = errors.join('. ');
    }
});

// Signup validation
function getSignupFormErrors(firstname, email, password, repeatPassword) {
    let errors = [];

    if (!firstname) {
        errors.push('Firstname is required');
        firstname_input.parentElement.classList.add('incorrect');
    }
    if (!email) {
        errors.push('Email is required');
        email_input.parentElement.classList.add('incorrect');
    }
    if (!password) {
        errors.push('Password is required');
        password_input.parentElement.classList.add('incorrect');
    }
    if (!repeatPassword) {
        errors.push('Repeat password is required');
        repeat_password_input.parentElement.classList.add('incorrect');
    }
    if (password && password.length < 8) {
        errors.push('Password must have at least 8 characters');
        password_input.parentElement.classList.add('incorrect');
    }
    if (password && repeatPassword && password !== repeatPassword) {
        errors.push('Passwords do not match');
        password_input.parentElement.classList.add('incorrect');
        repeat_password_input.parentElement.classList.add('incorrect');
    }

    return errors;
}

// Login validation
function getLoginFormErrors(email, password) {
    let errors = [];

    if (!email) {
        errors.push('Email is required');
        email_input.parentElement.classList.add('incorrect');
    }
    if (!password) {
        errors.push('Password is required');
        password_input.parentElement.classList.add('incorrect');
    }
    if (password && password.length < 8) {
        errors.push('Password must have at least 8 characters');
        password_input.parentElement.classList.add('incorrect');
    }

    return errors;
}

const allInputs = [firstname_input, email_input, password_input, repeat_password_input].filter(Boolean);

allInputs.forEach(input => {
    input.addEventListener('input', () => {
        if (input.parentElement.classList.contains('incorrect')) {
            input.parentElement.classList.remove('incorrect');
            error_message.innerText = "";
        }
    });
});
