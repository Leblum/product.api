import * as api from "superagent";
import { Config } from "../config/config";
import log = require('winston');
import { Request } from 'express';
import { CONST } from '../constants';

export class EmailVerificationNotification {
    public static async sendVerificationEmail(emailAddress: string, id: string, request: Request): Promise<void> {
        try{
        let mandrillResponse = await api
            .post('https://mandrillapp.com/api/1.0/messages/send-template.json')
            .send({
                "key": `${Config.active.get('mandrillApiKey')}`,
                "template_name": "verify-your-email-1",
                "template_content": [],
                "message": {
                    "from_email": "no-reply@leblum.com",
                    "to": [
                        {
                            "email": `${emailAddress}`
                        }
                    ],
                    "headers": {
                        "Reply-To": "no-reply@leblum.com"
                    },
                    "global_merge_vars": [
                        {
                            "name": "USER_VERIFICATION_LINK",
                            "content":  `${request.protocol}://${request.get('host')}${CONST.ep.client.VERIFY_EMAIL}?id=${id}`
                        }
                    ],
                    "merge_vars": []
                },
                "tracking_domain": "leblum.com",
                "signing_domain": "leblum.com",
                "return_path_domain": "leblum.com",
                "merge": true,
                "merge_language": "mailchimp",
                "async": false
            });
        }
        catch(err){
            log.error('There was a problem sending a verification email to mandrill', {
                mandrillResponse: err && err.response && err.response.body ? err.response.body: err
            });
            throw ({
                message: 'There was a problem sending the email verification',
                mandrillResponse: err && err.response && err.response.body ? err.response.body: err
            })
        }

        return;
    }
}