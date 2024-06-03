import { validationResult } from 'express-validator';
import { Request, Response } from "express";


export class Controller {

    static withValidation = (req: Request, res: Response, next: any) => {
        const errors = validationResult(req);
        if ( !errors.isEmpty() ) {
            // Format and send custom error messages
            const errorMessages = errors.array().map((error: any) => error.msg);
            return res.status(400).json({ errors: errorMessages });
        }
        next();
    }

    /**
     * A static method to sanitize a string by replacing potentially harmful characters with their HTML encoded equivalents.
     *
     * @param str - The string to sanitize.
     * @returns The sanitized string.
     *
     * @remarks
     * This method is used to prevent Cross-Site Scripting (XSS) attacks by replacing the following characters:
     * - `&` with `&amp;`
     * - `<` with `&lt;`
     * - `>` with `&gt;`
     * - `"` with `&quot;`
     * - `'` with `&#39;`
     * - `/` with `&#x2F;`
     *
     * @example
     * ```typescript
     * const unsafeString = '<script>alert("XSS Attack");</script>';
     * const sanitizedString = Controller.sanitizeString(unsafeString);
     * console.log(sanitizedString); // Outputs: &lt;script&gt;alert(&#34;XSS Attack&#34;);&lt;/script&gt;
     * ```
     */
    protected static sanitizeString = (str: string): string => {
        return str.replace(/[&<>"'/]/g, (match: string): string => {
            switch ( match ) {
                case '&':
                    return '&amp;';
                case '<':
                    return '&lt;';
                case '>':
                    return '&gt;';
                case '"':
                    return '&quot;';
                case "'":
                    return '&#39;';
                case '/':
                    return '&#x2F;';
                default:
                    return match;
            }
        });
    };
}