import { SET_TOKEN } from "./authTypes";

function isJson(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        //the json is  not ok
        return false;
    }
    //the json is ok
    return true;
}

export const login = async (data, dispatchToken) => {
    const requestOptions = {
        method: "POST",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    };

    try {
        const response = await fetch(
            `http://127.0.0.1:8000/api/token`,
            requestOptions
        );

        if (response.ok) {
            const res = await response.json();
            window.localStorage.setItem("userToken", res.token);
            dispatchToken({ type: SET_TOKEN, token: res.token });
            return {
                ok: true,
                successMessage: "Login Successfull.",
                errors: null,
            };
        } else {
            const res = await response.json();
            return {
                ok: false,
                successMessage: null,
                errors: { password: res.errors["non_field_errors"] },
            };
        }
    } catch (error) {
        alert(error);
    }
};

export const register = async (data, dispatchToken) => {
    const requestOptions = {
        method: "POST",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    };

    try {
        const response = await fetch(
            `http://127.0.0.1:8000/api/register`,
            requestOptions
        );

        if (response.ok) {
            const res = await response.json();
            window.localStorage.setItem("userToken", res.token);
            dispatchToken({ type: SET_TOKEN, token: res.token });
            return {
                ok: true,
                successMessage: "Register Successfull.",
                errors: null,
            };
        } else {
            const res = await response.json();
            return {
                ok: false,
                successMessage: null,
                errors: res["errors"],
            };
        }
    } catch (error) {
        alert(error);
    }
};
