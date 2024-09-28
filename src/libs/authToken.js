import { jwtDecode } from "jwt-decode"
import { ref } from "vue"
import Cookies from 'js-cookie'
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
function checkUserInAuthToken(oid1,oid2) {
    if (oid1 === oid2) {
        return true
    } else{
        return false
    }
}

function checkAuthToken() {
    token.value = Cookies.get("token")
    // console.log(token.value);
    if (!token.value) {
        return false
    } else{
        return true
    }

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

export {getAuthToken,clearCookies,setAuthToken,checkAuthToken,checkUserInAuthToken}