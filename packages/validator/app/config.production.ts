import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve(__dirname, "../../../.env.secrets") });

import CONFIG from '../../../configs/validator.config.production'
export default CONFIG