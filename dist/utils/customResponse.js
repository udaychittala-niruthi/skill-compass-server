export const sendResponse = (res, status, message, code = 200, body, err) => {
    const response = {
        status,
        message,
        ...(body != undefined && { body }),
        ...(err && { err })
    };
    return res.status(code).json(response);
};
