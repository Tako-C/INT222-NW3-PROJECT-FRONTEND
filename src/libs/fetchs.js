import Cookies from "js-cookie"
import { jwtDecode } from "jwt-decode";
import { ref } from "vue";
// Path URL
const url = import.meta.env.VITE_BASE_URL
let token = ref('')
function getAuthToken() {
    return token.value = Cookies.get("token")
}



function setAuthToken(result) {
    const token_raw = JSON.parse(result);  // Parse result into JSON before using
    const decodedToken = jwtDecode(token_raw.access_token);  // Decode access_token
    const now = Math.floor(Date.now() / 1000);
    const exp = decodedToken.exp;

    const cookieExpiresInSeconds = exp - now;
    const cookieExpiresInDays = cookieExpiresInSeconds / (60 * 60 * 24);

    Cookies.set("token", token_raw.access_token, { expires: cookieExpiresInDays });
    // Store the decoded claims in cookies
    Cookies.set("name", decodedToken.name, { expires: cookieExpiresInDays });
    Cookies.set("oid", decodedToken.oid, { expires: cookieExpiresInDays });
    Cookies.set("iss", decodedToken.iss, { expires: cookieExpiresInDays });
    Cookies.set("email", decodedToken.email, {expires: cookieExpiresInDays,});
    Cookies.set("role", decodedToken.role, { expires: cookieExpiresInDays });
    Cookies.set("iat", decodedToken.iat, { expires: cookieExpiresInDays });
    Cookies.set("exp", decodedToken.exp, { expires: cookieExpiresInDays });

}

function clearCookies() {

    const cookieNames = ["token", "name", "oid", "iss", "email", "role", "iat", "exp"];
    cookieNames.forEach(name => {
        Cookies.remove(name);
    });
}
// GetData
// async function getData(path) {
//     try {
//         // const res = await fetch(`http://ip23nw3.sit.kmutt.ac.th:8080/v2/${path}`)
//         const res = await fetch(`${url}/v2/${path}`)

//         if (!res.ok) {
//             throw new Error("Failed to fetch data")
//         }
//         const data = await res.json()
//         return data
//     } catch (error) {
//         console.error("Error fetching data:", error)
//         throw error
//     }
// }

// async function removeById(path, id) {
//     try {
//         const res = await fetch(`${url}/v2/${path}/${id}`, {
//             method: "DELETE",
//         })
//         if (!res.ok) {
//             if (res.status === 404) {
//                 // Handle 404 error
//                 return res
//             } else {
//                 throw new Error("Failed to delete task")
//             }
//         }
//         console.log("Task deleted successfully")
//         return res
//     } catch (error) {
//         console.error("Error deleting task:", error)
//         throw error
//     }
// }

// async function editData(path, taskId, data) {
//     try {
//         const response = await fetch(`${url}/v2/${path}/${taskId}`, {
//             method: "PUT",
//             headers: {
//                 "Content-Type": "application/json",
//             },
//             body: JSON.stringify(data),
//         })

//         if (!response.ok) {
//             const errorMessage = await response.text()
//             throw new Error(errorMessage)
//         }
//         const result = await response.json()
//         console.log("Success:", result)
//         return result
//     } catch (error) {
//         console.error("Error:", error.message)
//         throw error
//     }
// }

// async function removeAndTransfer(path, removeId, transferId) {
//     try {
//         const res = await fetch(`${url}/v2/${path}/${removeId}/${transferId}`, {
//             method: "DELETE",
//         })
//         if (!res.ok) {
//             if (res.status === 404) {
//                 // Handle 404 error
//                 return res
//             } else {
//                 throw new Error("Failed to delete task")
//             }
//         }
//         console.log("Status removed and tasks transferred successfully")
//         return res
//     } catch (error) {
//         console.error("Error removing status and transferring tasks:", error)
//         throw error
//     }
// }




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
        const result = await res.text();
        if (result) {
            setAuthToken(result)

            console.log("Login successful:", result);
        } else {
            console.error("Token not found in response");
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
    try {
        // const res = await fetch(`http://ip23nw3.sit.kmutt.ac.th:8080/v2/${path}`)

        if (!getAuthToken) {
            throw new Error("Token not found")
        }
        const res = await fetch(`${url}/v3/${path}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token.value}`, // Add the token in Authorization header
            },
        })

        if (!res.ok) {
            throw new Error("Failed to fetch data")
        }
        const data = await res.json()
        return data
    } catch (error) {
        console.error("Error fetching data:", error)
        throw error
    }
}

async function getTaskByBoard(path) {
    // console.log(url,path);
    // console.log(token);
    getAuthToken()
    try {
        const res = await fetch(`${url}/v3/boards/${path}`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token.value}`,
                "Content-Type": "application/json",
            },
        })

        if (!res.ok) {
            throw new Error("Failed to fetch data")
        }
        const data = await res.json()
        
        return data
    } catch (error) {
        console.error("Error fetching data:", error)
        throw error
    }
}

async function createStatus(data, path) {
    getAuthToken()
    try {
        const response = await fetch(`${url}/v3/boards/${path}`, {
            method: "POST", // or 'PUT'
            headers: {
                "Authorization": `Bearer ${token.value}`,
                "Content-Type": "application/json",
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

async function addData(data, path) {
    getAuthToken()
    try {
        const response = await fetch(`${url}/v3/boards/${path}`, {
            method: "POST", // or 'PUT'
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token.value}`,
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

async function editDatas(path, data) {
    getAuthToken()
    return fetch(`${url}/v3/${path}`, {
        method: "PUT",
        headers: {
            "Authorization": `Bearer ${token.value}`,
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
                "Authorization": `Bearer ${token.value}`,
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
    try {
        const res = await fetch(`${url}/v3/${path}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${token.value}`,
            },
        })
        if (!res.ok) {
          console.log(res);
          
            if (res.status === 401) {
                // Handle 401 error
                return res
            } else {
                throw new Error("Failed to delete task")
            }
        }
        console.log("Task deleted successfully")
        return res
    } catch (error) {
        console.error("Error deleting task:", error)
        throw error
    }
}


// async function editStatus(status_ID, data) {
//   try {
//     const response = await fetch(
//       `${url}/v2/statuses/${status_ID}`,
//       {
//         method: 'PUT',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(data),
//       }
//     )

//     if (!response.ok) {
//       const errorMessage = await response.text()
//       throw new Error(errorMessage)
//     }
//     const result = await response.json()
//     console.log('Success:', result)
//     return result
//   } catch (error) {
//     console.error('Error:', error.message)
//     throw error
//   }
// }

// async function addStatus(path, data) {
//   try {
//     const response = await fetch(
//       `${url}/v2/${path}`,
//       {
//         method: 'POST', // or 'PUT'
//         headers: {
//           'Content-Type': 'application/json',
//         },

//         body: JSON.stringify(data),
//       }
//     )
//     console.log(data)
//     const result = await response.json()
//     console.log('Success:', result)
//     return result
//   } catch (error) {
//     console.error('Error:', error)
//   }
// }

export {
    // getData,
    // removeById,
    addData,
    // editData,
    // removeAndTransfer,
    login,
    getBoard,
    getTaskByBoard,
    createStatus,
    editDatas,
    addBoard,
    removeData,
    clearCookies
}
