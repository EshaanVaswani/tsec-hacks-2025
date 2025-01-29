import axios from 'axios';
export const getUser = async (_id:string)=>{
    try {
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/user/userInfo/${_id}`,{
            withCredentials: true,
        })
        return response.data.user
    } catch (error) {
        console.log(error)
        return null
    }
}

const headers = {
    'Content-Type': 'application/json',
}

export const registerUser = async (name:string, email:string, username:string, password:string)=>{
    try {
        const user =  await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/user/register`,{
            name,
            email,
            username,
            password
        },{
            headers,
            withCredentials: true
        })
        return user
    } catch (error) {
        console.log(error)
        return null
    }
}

export const loginUser = async (email:string, password:string)=>{
    try {
        const user =  await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/user/login`,{
            email,
            password
        },{
            headers,
            withCredentials: true
        })
        return user
    } catch (error) {
        console.log(error)
        return null
    }
}


export const logoutUser = async()=>{
    try {
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/user/logout`,{
            withCredentials: true
        })
        return response
    } catch (error) {
        console.log(error)
        return null
    }
}