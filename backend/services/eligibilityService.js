/**
 * Parses age range like "18-30" or "18+" or "<30" and checks if user age fits.
 */
function checkAge(userAge, criteriaValue) {
  if (userAge === undefined || userAge === null) return false;
  
  if (criteriaValue.includes('-')) {
    const [min, max] = criteriaValue.split('-').map(Number);
    return userAge >= min && userAge <= max;
  }
  
  if (criteriaValue.includes('+')) {
    const min = Number(criteriaValue.replace('+', ''));
    return userAge >= min;
  }
  
  if (criteriaValue.startsWith('<=')) {
    const max = Number(criteriaValue.replace('<=', ''));
    return userAge <= max;
  }
  
  if (criteriaValue.startsWith('<')) {
    const max = Number(criteriaValue.replace('<', ''));
    return userAge < max;
  }
  
  if (criteriaValue.startsWith('>=')) {
    const min = Number(criteriaValue.replace('>=', ''));
    return userAge >= min;
  }
  
  if (criteriaValue.startsWith('>')) {
    const min = Number(criteriaValue.replace('>', ''));
    return userAge > min;
  }

  const exact = Number(criteriaValue);
  if (!isNaN(exact)) {
    return userAge === exact;
  }

  return true;
}

/**
 * Parses annual income criteria like "<=250000" or "<300000" and checks against user income.
 */
function checkIncome(userIncome, criteriaValue) {
  if (userIncome === undefined || userIncome === null) return false;
  
  const val = parseFloat(userIncome);
  
  if (criteriaValue.startsWith('<=')) {
    const limit = parseFloat(criteriaValue.replace('<=', ''));
    return val <= limit;
  }
  
  if (criteriaValue.startsWith('<')) {
    const limit = parseFloat(criteriaValue.replace('<', ''));
    return val < limit;
  }
  
  if (criteriaValue.startsWith('>=')) {
    const limit = parseFloat(criteriaValue.replace('>=', ''));
    return val >= limit;
  }
  
  if (criteriaValue.startsWith('>')) {
    const limit = parseFloat(criteriaValue.replace('>', ''));
    return val > limit;
  }

  const exact = parseFloat(criteriaValue);
  if (!isNaN(exact)) {
    return val === exact;
  }

  return true;
}

/**
 * Evaluates eligibility for a single scheme against a user profile.
 */
function evaluateEligibilityForScheme(profile, scheme, criteria) {
  if (!criteria || criteria.length === 0) {
    return {
      status: 'eligible',
      matchScore: 100,
      reasons: ['No specific eligibility criteria specified.']
    };
  }

  const reasons = [];
  const failures = [];
  const partialFailures = [];

  criteria.forEach(crit => {
    const type = crit.criteria_type;
    const value = crit.criteria_value;
    const description = crit.criteria_description || '';

    if (!value) return; // skip empty criteria

    switch (type) {
      case 'age': {
        const meetsAge = checkAge(profile.age, value);
        if (!meetsAge) {
          failures.push(`Age is ${profile.age || 'not specified'}, but the scheme requires age: ${value}.`);
        } else {
          reasons.push(`Meets age requirement of ${value}.`);
        }
        break;
      }
      case 'annual_income': {
        const meetsIncome = checkIncome(profile.annual_income, value);
        if (!meetsIncome) {
          failures.push(`Annual income is ₹${Number(profile.annual_income || 0).toLocaleString()}, but the scheme requires: ${value}.`);
        } else {
          reasons.push(`Annual income is within the required limit (${value}).`);
        }
        break;
      }
      case 'state': {
        const allowedStates = value.split(',').map(s => s.trim().toLowerCase());
        const userState = (profile.state || '').trim().toLowerCase();
        const isStateMatch = userState && (
          allowedStates.includes(userState) ||
          allowedStates.includes('all') ||
          allowedStates.includes('all india') ||
          allowedStates.includes('central')
        );
        if (!isStateMatch) {
          failures.push(`Resides in ${profile.state || 'not specified'}, but the scheme requires state: ${value}.`);
        } else {
          reasons.push(`Resides in the eligible state: ${profile.state}.`);
        }
        break;
      }
      case 'district': {
        const allowedDistricts = value.split(',').map(d => d.trim().toLowerCase());
        const userDistrict = (profile.district || '').trim().toLowerCase();
        const isDistrictMatch = userDistrict && allowedDistricts.includes(userDistrict);
        if (!isDistrictMatch) {
          failures.push(`Resides in ${profile.district || 'not specified'}, but the scheme requires district: ${value}.`);
        } else {
          reasons.push(`Resides in the eligible district: ${profile.district}.`);
        }
        break;
      }
      case 'gender': {
        const allowedGenders = value.split(',').map(g => g.trim().toLowerCase());
        const userGender = (profile.gender || '').trim().toLowerCase();
        const isGenderMatch = allowedGenders.some(g => {
          if (g === userGender) return true;
          if ((g === 'female' || g === 'women' || g === 'woman') && userGender === 'female') return true;
          if ((g === 'male' || g === 'men' || g === 'man') && userGender === 'male') return true;
          return false;
        });
        if (!isGenderMatch) {
          failures.push(`Gender is ${profile.gender || 'not specified'}, but the scheme targets: ${value}.`);
        } else {
          reasons.push(`Gender matches eligibility requirements.`);
        }
        break;
      }
      case 'category': {
        const allowedCategories = value.split(',').map(c => c.trim().toLowerCase());
        const userCategory = (profile.category || '').trim().toLowerCase();
        const isCategoryMatch = userCategory && allowedCategories.includes(userCategory);
        if (!isCategoryMatch) {
          failures.push(`Caste category is ${profile.category || 'not specified'}, but the scheme is restricted to: ${value}.`);
        } else {
          reasons.push(`Social category ${profile.category} matches requirements.`);
        }
        break;
      }
      case 'disability_status': {
        const isDisabilityMatch = profile.disability_status && profile.disability_status.toLowerCase() === value.toLowerCase();
        if (!isDisabilityMatch) {
          failures.push(`Disability status is ${profile.disability_status || 'not specified'}, but the scheme requires: ${value}.`);
        } else {
          reasons.push(`Disability status matches requirements.`);
        }
        break;
      }
      case 'occupation': {
        const allowedOccupations = value.split(',').map(o => o.trim().toLowerCase());
        const userOccupation = (profile.occupation || '').trim().toLowerCase();
        const isOccupationMatch = userOccupation && allowedOccupations.includes(userOccupation);
        if (!isOccupationMatch) {
          partialFailures.push(`Occupation is ${profile.occupation || 'not specified'}, but the scheme targets: ${value}.`);
        } else {
          reasons.push(`Occupation matches requirement of ${value}.`);
        }
        break;
      }
      case 'education': {
        const allowedEducations = value.split(',').map(e => e.trim().toLowerCase());
        const userEducation = (profile.education || '').trim().toLowerCase();
        const isEducationMatch = userEducation && allowedEducations.includes(userEducation);
        if (!isEducationMatch) {
          partialFailures.push(`Education is ${profile.education || 'not specified'}, but the scheme requires: ${value}.`);
        } else {
          reasons.push(`Education matches requirement of ${value}.`);
        }
        break;
      }
      default:
        // Generic fallback check (check string contains)
        if (profile[type]) {
          const isGenericMatch = String(profile[type]).toLowerCase() === value.toLowerCase();
          if (!isGenericMatch) {
            failures.push(`${type} is ${profile[type]}, but the scheme requires: ${value}.`);
          }
        }
        break;
    }
  });

  const totalCriteriaCount = criteria.length;
  const failedCount = failures.length + partialFailures.length;
  const matchScore = totalCriteriaCount > 0 ? Math.round(((totalCriteriaCount - failedCount) / totalCriteriaCount) * 100) : 100;

  if (failures.length > 0) {
    return {
      status: 'ineligible',
      matchScore,
      reasons: failures
    };
  }

  if (partialFailures.length > 0) {
    return {
      status: 'partially_eligible',
      matchScore,
      reasons: [...reasons, ...partialFailures, 'You might qualify by submitting secondary documents or declarations.']
    };
  }

  return {
    status: 'eligible',
    matchScore,
    reasons: reasons.length > 0 ? reasons : ['You satisfy all criteria defined for this scheme.']
  };
}

module.exports = {
  evaluateEligibilityForScheme
};
