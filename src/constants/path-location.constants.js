const HOME_PAGE_PATH = '/home-page';
const CREATE_PASSWORD = '/create-password';
const SECRET_PHRASE_PATH = '/secret-phrase';
const WELCOME_BACK_PATH = '/welcome-back';
const PERSONAL_AREA_PATH = '/personal-area';
const RESTORE_ACCOUNT_PATH = '/restore-account';
const DEPOSIT_PATH = '/deposit';
const SEND_PAGE_PATH = '/send';
const CONFIRM_PAGE_PATH = '/confirm';
const PRODUCTION = process.env.REACT_APP_API_ENVIRONMENT;
process.env.ENVIRONMENT_BG = "development";

export {
    HOME_PAGE_PATH,
    CREATE_PASSWORD,
    SECRET_PHRASE_PATH,
    WELCOME_BACK_PATH,
    PERSONAL_AREA_PATH,
    RESTORE_ACCOUNT_PATH,
    DEPOSIT_PATH,
    SEND_PAGE_PATH,
    CONFIRM_PAGE_PATH,
    PRODUCTION,
};
