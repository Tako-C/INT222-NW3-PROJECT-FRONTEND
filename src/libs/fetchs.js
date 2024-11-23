

import { getAuthToken,clearCookies,setAuthToken} from '@/libs/authToken.js'
// Path URL
const url = import.meta.env.VITE_BASE_URL

async function requestToken(refresh_token) {
    console.log(refresh_token)
    
    const res = await fetch(`${url}/token`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${refresh_token}`,
        }
    })

    if (res.ok) {
        const result = await res.json()
        if (result) {

            console.log("request successful:", result)
        } else {
            console.error("Token not found in response")
        }
        console.log("request successful:")
        console.log(result)
        
        return result
    } else {
        console.log("Error during login:", res.statusText)
        return null
    }
}

async function login(username, password) {
    const res = await fetch(`${url}/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            userName: username,
            password: password,
        }),
    })

    if (res.ok) {
        const result = await res.text()
        if (result) {
            setAuthToken(result)

            console.log("Login successful:", result)
        } else {
            console.error("Token not found in response")
        }
        console.log("Login successful:")
        return result
    } else {
        console.log("Error during login:", res.statusText)
        return null
    }
}

async function getDataByBoard(path) {
    getAuthToken()
    const response = await fetch(`${url}/v3/boards/${path}`, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${getAuthToken()}`, // Add the token in the Authorization header
            "Content-Type": "application/json",
        },
    })

    if (!response.ok) {
        const error = await response.json()
        return error
    }

    const data = await response.json()
    return data
}

async function addData(data, path) {
    getAuthToken()

    if (!getAuthToken()) {
        console.error("Token not found")
    }

    const response = await fetch(`${url}/v3/${path}`, {
        method: "POST", // or 'PUT' if needed
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getAuthToken()}`, // Add the token in the Authorization header
        },
        body: JSON.stringify(data),
    })

    if (!response.ok) {
        const error = await response.json()
        return error;
    }

    const result = await response.json()
    console.log("Success:", result)
    return result
}

async function editDatas(path, data) {
    getAuthToken()

    if (!getAuthToken()) {

    }

    const response = await fetch(`${url}/v3/${path}`, {
        method: "PUT",
        headers: {
            Authorization: `Bearer ${getAuthToken()}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const error = await response.json()
        return error
    }

    const result = await response.json();
    console.log("Success:", result);
    return result;
}

async function removeData(path) {
    getAuthToken()
    if (!getAuthToken()) {
        console.error("Token not found")
    }

    const response = await fetch(`${url}/v3/${path}`, {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${getAuthToken()}`, 
        },
    })

    if (!response.ok) {
        const error = await response.json()
        return error;
        
    }

    console.log("Task deleted successfully")
    return response
}

async function PatchData(path,data) {
    getAuthToken()
    if (!getAuthToken()) {
        console.error("Token not found")
    }

    const response = await fetch(`${url}/v3/${path}`, {
        method: "PATCH",
        headers: {
            Authorization: `Bearer ${getAuthToken()}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    })

    if (!response.ok) {
        const error = await response.json()
        return error;
        
    }
    return response
}

async function getAllBoard(path) {
    getAuthToken()

    if (!getAuthToken()) {
        console.error("Token not found")
    }

    const response = await fetch(`${url}/v3/${path}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getAuthToken()}`
        },
        
    })

    if (!response.ok) {
        const error = await response.json()
        return error
    }

    const data = await response.json()
    return data
}
async function getAllBoardByPublic(path) {
    getAuthToken()

    if (!getAuthToken()) {
        console.error("Token not found")
    }

    const response = await fetch(`${url}/v3/${path}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Authorization: ``
        },
        
    })

    if (!response.ok) {
        const error = await response.json()
        return error
    }
    const data = await response.json()
    return data
}

async function accept(path) {
    getAuthToken()
    if (!getAuthToken()) {
        console.error("Token not found")
    }

    const response = await fetch(`${url}/v3/${path}`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${getAuthToken()}`, 
        },
    })

    if (!response.ok) {
        const error = await response.json()
        return error;
        
    }

    console.log("Task deleted successfully")
    return response
}

export {
    addData,
    requestToken,
    login,
    getAllBoardByPublic,
    getDataByBoard,
    editDatas,
    removeData,
    clearCookies,
    PatchData,
    getAllBoard,
    accept
}
