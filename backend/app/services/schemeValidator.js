/**
 * Scheme Validator & Safety Guard Service
 * 
 * Enforces strict validation rules on incoming synchronization data:
 * - Prevents corrupt, malformed, or incomplete records from entering PostgreSQL.
 * - Enforces record preservation: existing schemes, child benefits, criteria, documents,
 *   and steps can NEVER be deleted automatically by a synchronization process.
 * - Detects field-level diffs before applying updates.
 */

class SchemeValidator {
  /**
   * Validate scheme basic structure
   * @param {Object} scheme 
   * @returns {{ isValid: boolean, errors: string[] }}
   */
  static validateSchemeStructure(scheme) {
    const errors = [];

    if (!scheme || typeof scheme !== 'object') {
      return { isValid: false, errors: ['Scheme payload must be a non-null object'] };
    }

    // 1. scheme_code validation
    if (!scheme.scheme_code || typeof scheme.scheme_code !== 'string') {
      errors.push('scheme_code is required and must be a string');
    } else {
      const code = scheme.scheme_code.trim();
      if (code.length < 3 || code.length > 50) {
        errors.push(`scheme_code must be between 3 and 50 characters (got ${code.length})`);
      }
      if (!/^[A-Za-z0-9_-]+$/.test(code)) {
        errors.push(`scheme_code "${code}" contains invalid characters (allowed: alphanumeric, -, _)`);
      }
    }

    // 2. name validation
    if (!scheme.name || typeof scheme.name !== 'string') {
      errors.push('name is required and must be a string');
    } else {
      const name = scheme.name.trim();
      if (name.length < 5 || name.length > 300) {
        errors.push(`name must be between 5 and 300 characters (got ${name.length})`);
      }
    }

    // 3. official_website validation
    if (scheme.official_website) {
      if (typeof scheme.official_website !== 'string') {
        errors.push('official_website must be a string');
      } else {
        const url = scheme.official_website.trim();
        try {
          const parsed = new URL(url);
          if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
            errors.push('official_website must use http or https protocol');
          }
        } catch (e) {
          errors.push(`official_website is an invalid URL format: "${url}"`);
        }
      }
    }

    // 4. state validation
    if (scheme.state !== undefined && scheme.state !== null) {
      if (typeof scheme.state !== 'string' || scheme.state.trim().length === 0) {
        errors.push('state must be a non-empty string when provided');
      }
    }

    // 5. dates validation (if present)
    if (scheme.application_start) {
      const start = new Date(scheme.application_start);
      if (isNaN(start.getTime())) {
        errors.push(`application_start is not a valid date: "${scheme.application_start}"`);
      }
    }
    if (scheme.application_end) {
      const end = new Date(scheme.application_end);
      if (isNaN(end.getTime())) {
        errors.push(`application_end is not a valid date: "${scheme.application_end}"`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Compare existing database scheme with incoming updates to detect field diffs.
   * Only returns changed fields to prevent unnecessary database writes.
   * @param {Object} existing 
   * @param {Object} incoming 
   * @returns {{ hasChanges: boolean, diffs: Object }}
   */
  static detectDifferences(existing, incoming) {
    const diffs = {};
    if (!existing || !incoming) return { hasChanges: false, diffs };

    const checkFields = [
      'name',
      'description',
      'target_audience',
      'state',
      'official_website',
      'application_start',
      'application_end'
    ];

    for (const field of checkFields) {
      if (incoming[field] !== undefined && incoming[field] !== null) {
        const existVal = existing[field] ? String(existing[field]).trim() : '';
        const incomingVal = String(incoming[field]).trim();

        if (existVal !== incomingVal && incomingVal.length > 0) {
          diffs[field] = {
            from: existing[field],
            to: incoming[field]
          };
        }
      }
    }

    return {
      hasChanges: Object.keys(diffs).length > 0,
      diffs
    };
  }

  /**
   * Safety guard: Rejects any attempt to erase or overwrite verified data with null/empty values.
   * @param {Object} existing 
   * @param {Object} incoming 
   * @returns {{ isSafe: boolean, warning?: string }}
   */
  static assertSafeUpdate(existing, incoming) {
    if (!existing) {
      return { isSafe: true };
    }

    // Check if incoming payload attempts to nullify essential existing information
    if (existing.description && existing.description.length > 20 && (!incoming.description || incoming.description.trim().length === 0)) {
      return {
        isSafe: false,
        warning: 'Blocked attempt to overwrite rich existing description with empty text.'
      };
    }

    if (existing.official_website && (!incoming.official_website || incoming.official_website.trim().length === 0)) {
      return {
        isSafe: false,
        warning: 'Blocked attempt to nullify existing verified official_website URL.'
      };
    }

    return { isSafe: true };
  }
}

module.exports = SchemeValidator;
