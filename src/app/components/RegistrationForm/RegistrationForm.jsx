import React, { useState } from 'react'
import './RegistrationForm.css'
import { MyButton } from '../UI'


function RegistrationForm() {

    const [form, setForm] = useState({
        email: '',
        password: ''
    })

    function handleInputEmail(event) {
        setForm(prev => ({
            ...prev,
            email: event.target.value,
        }))
    }

    function handleInputPassword(event) {
        setForm(prev => ({
            ...prev,
            password: event.target.value,
        }))
    }

    function handleSubmit() {
        console.log(form.email);
        console.log(form.password);
    }


    return (
        <form className='form' action="">
            <label htmlFor="email">Почта</label>
            <input id='email' type="email" required onChange={handleInputEmail} value={form.email} />
            
            <label htmlFor="password">Пароль</label>
            <input id='password' type="password" required onChange={handleInputPassword} value={form.password} />
            
            <MyButton type='submit' onClick={handleSubmit} text="Войти"/>
        </form>
    )
}


export default RegistrationForm;
