import Cookies from "js-cookie"
import { jwtDecode } from "jwt-decode"
import { ref } from "vue"
// Path URL
const url = import.meta.env.VITE_BASE_URL
let token = ref("")

function getAuthToken() {
    return (token.value = Cookies.get("token"))
}

function setAuthToken(result) {
    const token_raw = JSON.parse(result) // Parse result into JSON before using
    const decodedToken = jwtDecode(token_raw.access_token) // Decode access_token
    const now = Math.floor(Date.now() / 1000)
    const exp = decodedToken.exp

    const cookieExpiresInSeconds = exp - now
    const cookieExpiresInDays = cookieExpiresInSeconds / (60 * 60 * 24)

    Cookies.set("token", token_raw.access_token, {
        expires: cookieExpiresInDays,
    })
    // Store the decoded claims in cookies
    Cookies.set("name", decodedToken.name, { expires: cookieExpiresInDays })
    Cookies.set("oid", decodedToken.oid, { expires: cookieExpiresInDays })
    Cookies.set("iss", decodedToken.iss, { expires: cookieExpiresInDays })
    Cookies.set("email", decodedToken.email, { expires: cookieExpiresInDays })
    Cookies.set("role", decodedToken.role, { expires: cookieExpiresInDays })
    Cookies.set("iat", decodedToken.iat, { expires: cookieExpiresInDays })
    Cookies.set("exp", decodedToken.exp, { expires: cookieExpiresInDays })
}

function clearCookies() {
    const cookieNames = [
        "token",
        "name",
        "oid",
        "iss",
        "email",
        "role",
        "iat",
        "exp",
    ]
    cookieNames.forEach((name) => {
        Cookies.remove(name)
    })
}

async function login(username, password) {
    const res = await fetch(`${url}/api/login`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
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

async function getBoard(path) {
    getAuthToken()

    if (!token) {
        console.error("Token not found")
        throw new Error("Token not found")
    }

    const response = await fetch(`${url}/v3/${path}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token.value}`, // Add the token in the Authorization header
        },
    })

    if (!response.ok) {
        const error = await response.json()
        // console.error(
        //     "Error fetching data:",
        //     error.message || "Failed to fetch data"
        // )
        // throw new Error(error.message || "Failed to fetch data")
        return error
    }

    const data = await response.json()
    return data
}

async function getTaskByBoard(path) {
    getAuthToken()
    if (!token) {
        console.error("Token not found")
        throw new Error("Token not found")
    }

    const response = await fetch(`${url}/v3/boards/${path}`, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token.value}`, // Add the token in the Authorization header
            "Content-Type": "application/json",
        },
    })

    if (!response.ok) {
        const error = await response.json()
        // console.error(
        //     "Error fetching data:",
        //     error.message || "Failed to fetch data"
        // )
        // throw new Error(error.message || "Failed to fetch data")
        return error
    }

    const data = await response.json()
    return data
}

async function createStatus(data, path) {
    getAuthToken()
    if (!token) {
        console.error("Token not found")
        throw new Error("Token not found")
    }

    const response = await fetch(`${url}/v3/boards/${path}`, {
        method: "POST", // or 'PUT' if needed
        headers: {
            Authorization: `Bearer ${token.value}`, // Add the token in the Authorization header
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    })

    if (!response.ok) {
        const error = await response.json()
        // console.error("Error:", error.message || "Failed to create status")
        // throw new Error(error.message || "Failed to create status")
        return error
    }

    const result = await response.json()
    console.log("Success:", result)
    return result
}

async function addData(data, path) {
    getAuthToken()

    if (!token) {
        console.error("Token not found")
        throw new Error("Token not found")
    }

    const response = await fetch(`${url}/v3/boards/${path}`, {
        method: "POST", // or 'PUT' if needed
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token.value}`, // Add the token in the Authorization header
        },
        body: JSON.stringify(data),
    })

    if (!response.ok) {
        const error = await response.json()
        // console.error("Error:", error.message || "Failed to add data")
        // throw new Error(error.message || "Failed to add data")
        return error;
    }

    const result = await response.json()
    console.log("Success:", result)
    return result
}

async function editDatas(path, data) {
    getAuthToken()
    return fetch(`${url}/v3/${path}`, {
        method: "PUT",
        headers: {
            Authorization: `Bearer ${token.value}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    })
        .then((response) => {
            if (!response.ok) {
                return response.text().then((errorMessage) => {
                    throw new Error(errorMessage)
                })
            }
            return response.json()
        })
        .then((result) => {
            console.log("Success:", result)
            return result
        })
        .catch((error) => {
            console.error("Error:", error.message)
            throw error
        })
}

async function addBoard(data, path) {
    getAuthToken()
    try {
        const response = await fetch(`${url}/v3/${path}`, {
            method: "POST", // or 'PUT'
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token.value}`,
            },

            body: JSON.stringify(data),
        })
        const result = await response.json()
        console.log("Success:", result)
        return result
    } catch (error) {
        console.error("Error:", error)
    }
}

async function removeData(path) {
    getAuthToken()
    if (!token) {
        console.error("Token not found")
        throw new Error("Token not found")
    }

    const response = await fetch(`${url}/v3/${path}`, {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${token.value}`, // Add the token in the Authorization header
        },
    })

    if (!response.ok) {
        const error = await response.json()
        // console.error("Error:", error.message || "Failed to delete task")
        // throw new Error(error.message || "Failed to delete task")
        return error;
        
    }

    console.log("Task deleted successfully")
    return response
}

export {
    addData,
    login,
    getBoard,
    getTaskByBoard,
    createStatus,
    editDatas,
    addBoard,
    removeData,
    clearCookies,
}
