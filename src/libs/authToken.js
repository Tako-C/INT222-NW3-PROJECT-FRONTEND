import { jwtDecode } from "jwt-decode"
import { ref } from "vue"
import Cookies from 'js-cookie'
import { requestToken } from "@/libs/fetchs.js"
import { useRoute, useRouter } from "vue-router"

let token = ref("")
let refreshToken = ref('')
// const router = useRouter()
// const route = useRoute()

function getAuthToken() {
    return (token.value = Cookies.get("token"))
}

function checkUserInAuthToken(oid1, oid2) {
    return oid1 === oid2;
}

function checkAuthToken() {
    token.value = Cookies.get("token");
    return !!token.value;
}
function checkExpAuthToken() {
    token.value = Cookies.get("token")
    // console.log(token.value)
    const decodedToken = jwtDecode(token.value)
    const now = Math.floor(Date.now() / 1000)
    const exp = decodedToken.exp

    if (now > exp) {
        console.log("มากเกินไป");
        return true
    } else{
        return false
    }
}

function checkAuthRefreshToken() {
    refreshToken.value = Cookies.get("refresh_token");
    return !!refreshToken.value;
}


function requestNewToken() {
    fetchToken(Cookies.get("refresh_token"))
    Cookies.remove("refresh_token")
}


function checkrequestNewToken(router) {
    if (checkAuthToken()) {
      if (checkExpAuthToken()) {

        if (!checkAuthRefreshToken()) {
            router.push({ name: "login" })
            // console.log("Token ยังใช้งานต่อไม่ได้")
            clearCookies()
            
        } else {
          requestNewToken()
        }
      } else {
        // console.log("Token ใช้งานต่อได้")
      }
    } else {
    //   console.log("User Not Login")
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
        "refresh_token"
    ];
    cookieNames.forEach((name) => {
        Cookies.remove(name)
    });
}

async function fetchToken(token) {
    const result = await requestToken(token)
    const token_raw = result.access_token // Parse result into JSON before using
    const decodedToken = jwtDecode(token_raw); // Decode access_token
    const now = Math.floor(Date.now() / 1000)
    const exp = decodedToken.exp

    const cookieExpiresInSeconds = exp - now
    const cookieExpiresInDays = cookieExpiresInSeconds / (60 * 60 * 24)

    Cookies.set("token", token_raw)

    // Store the decoded claims in cookies
    Cookies.set("name", decodedToken.name, { expires: cookieExpiresInDays })
    Cookies.set("oid", decodedToken.oid, { expires: cookieExpiresInDays })
    Cookies.set("iss", decodedToken.iss, { expires: cookieExpiresInDays })
    Cookies.set("email", decodedToken.email, { expires: cookieExpiresInDays })
    Cookies.set("role", decodedToken.role, { expires: cookieExpiresInDays })
    Cookies.set("iat", decodedToken.iat, { expires: cookieExpiresInDays })
    Cookies.set("exp", decodedToken.exp, { expires: cookieExpiresInDays })
}

function setAuthToken(result) {

    const token_raw = JSON.parse(result); // Parse result into JSON before using
    const decodedToken = jwtDecode(token_raw.access_token); // Decode access_token
    const decodedRefreshToken = jwtDecode(token_raw.refresh_token); // Decode refresh_token
    const now = Math.floor(Date.now() / 1000);
    const exp = decodedToken.exp;
    const exp_RefreshToken = decodedRefreshToken.exp;

    const cookieExpiresInSeconds = exp - now;
    const cookieExpiresInDays = cookieExpiresInSeconds / (60 * 60 * 24);
    const cookieExpiresInSeconds_RefreshToken = exp_RefreshToken - now;
    const cookieExpiresInDays_RefreshToken = cookieExpiresInSeconds_RefreshToken / (60 * 60 * 24);

    Cookies.set("token", token_raw.access_token);
    Cookies.set("refresh_token", token_raw.refresh_token, { expires: cookieExpiresInDays_RefreshToken });

    // Store the decoded claims in cookies
    Cookies.set("name", decodedToken.name, { expires: cookieExpiresInDays });
    Cookies.set("oid", decodedToken.oid, { expires: cookieExpiresInDays });
    Cookies.set("iss", decodedToken.iss, { expires: cookieExpiresInDays });
    Cookies.set("email", decodedToken.email, { expires: cookieExpiresInDays });
    Cookies.set("role", decodedToken.role, { expires: cookieExpiresInDays });
    Cookies.set("iat", decodedToken.iat, { expires: cookieExpiresInDays });
    Cookies.set("exp", decodedToken.exp, { expires: cookieExpiresInDays });
}

export {
    getAuthToken,
    clearCookies,
    setAuthToken,
    checkAuthToken,
    checkAuthRefreshToken,
    checkUserInAuthToken,
    checkExpAuthToken,
    requestNewToken,
    checkrequestNewToken,
};
