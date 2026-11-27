import { describe, it, expect } from 'vitest';
import {
    isDangerConfirmationValid,
    getExpectedConfirmationPhrase,
} from './danger-modal-utils';

describe('Danger Modal Validation (Bilingual)', () => {
    describe('Deactivate Account Confirmation', () => {
        it('should accept Vietnamese phrase "TAM NGUNG" in any case and with whitespace', () => {
            expect(isDangerConfirmationValid('deactivate', 'TAM NGUNG')).toBe(true);
            expect(isDangerConfirmationValid('deactivate', 'tam ngung')).toBe(true);
            expect(isDangerConfirmationValid('deactivate', '  Tam Ngung  ')).toBe(true);
        });

        it('should accept English phrase "DEACTIVATE" in any case and with whitespace', () => {
            expect(isDangerConfirmationValid('deactivate', 'DEACTIVATE')).toBe(true);
            expect(isDangerConfirmationValid('deactivate', 'deactivate')).toBe(true);
            expect(isDangerConfirmationValid('deactivate', '  Deactivate  ')).toBe(true);
        });

        it('should reject incorrect phrases', () => {
            expect(isDangerConfirmationValid('deactivate', 'TAM')).toBe(false);
            expect(isDangerConfirmationValid('deactivate', 'XOA TAI KHOAN')).toBe(false);
            expect(isDangerConfirmationValid('deactivate', 'DELETE')).toBe(false);
            expect(isDangerConfirmationValid('deactivate', '')).toBe(false);
        });
    });

    describe('Delete Account Confirmation', () => {
        it('should accept Vietnamese phrase "XOA TAI KHOAN" in any case and with whitespace', () => {
            expect(isDangerConfirmationValid('delete', 'XOA TAI KHOAN')).toBe(true);
            expect(isDangerConfirmationValid('delete', 'xoa tai khoan')).toBe(true);
            expect(isDangerConfirmationValid('delete', '  Xoa Tai Khoan  ')).toBe(true);
        });

        it('should accept English phrase "DELETE ACCOUNT" in any case and with whitespace', () => {
            expect(isDangerConfirmationValid('delete', 'DELETE ACCOUNT')).toBe(true);
            expect(isDangerConfirmationValid('delete', 'delete account')).toBe(true);
            expect(isDangerConfirmationValid('delete', '  Delete Account  ')).toBe(true);
        });

        it('should reject incorrect phrases', () => {
            expect(isDangerConfirmationValid('delete', 'XOA')).toBe(false);
            expect(isDangerConfirmationValid('delete', 'TAM NGUNG')).toBe(false);
            expect(isDangerConfirmationValid('delete', 'DELETE')).toBe(false);
            expect(isDangerConfirmationValid('delete', '')).toBe(false);
        });
    });

    describe('Expected confirmation phrase helper', () => {
        it('should return correct phrase based on language', () => {
            expect(getExpectedConfirmationPhrase('deactivate', 'vi')).toBe('TAM NGUNG');
            expect(getExpectedConfirmationPhrase('deactivate', 'en')).toBe('DEACTIVATE');
            expect(getExpectedConfirmationPhrase('delete', 'vi')).toBe('XOA TAI KHOAN');
            expect(getExpectedConfirmationPhrase('delete', 'en')).toBe('DELETE ACCOUNT');
        });
    });
});
