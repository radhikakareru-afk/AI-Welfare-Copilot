export const calculateAge = (dobString) => {
  if (!dobString) return 0;
  const today = new Date();
  const birthDate = new Date(dobString);
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

export const evaluateEligibility = (profile, scheme) => {
  const rules = scheme.rules;
  if (!rules) {
    return { status: "eligible", reasons: ["No specific eligibility criteria specified."] };
  }

  const reasons = [];
  const failures = [];
  const age = calculateAge(profile.date_of_birth);

  // 1. Age check
  if (rules.age_min !== null && age < rules.age_min) {
    failures.push(`Age is ${age}, but the scheme requires a minimum age of ${rules.age_min} years.`);
  } else if (rules.age_min !== null) {
    reasons.push(`Meets minimum age requirement of ${rules.age_min} years (User age: ${age}).`);
  }

  if (rules.age_max !== null && age > rules.age_max) {
    failures.push(`Age is ${age}, but the scheme requires a maximum age of ${rules.age_max} years.`);
  } else if (rules.age_max !== null) {
    reasons.push(`Meets maximum age limit of ${rules.age_max} years (User age: ${age}).`);
  }

  // 2. Income check
  if (rules.income_max !== null && profile.annual_income > rules.income_max) {
    failures.push(`Annual income is ₹${Number(profile.annual_income || 0).toLocaleString()}, but the scheme limit is ₹${Number(rules.income_max).toLocaleString()}.`);
  } else if (rules.income_max !== null) {
    reasons.push(`Annual income is within the ₹${Number(rules.income_max).toLocaleString()} limit.`);
  }

  // 3. State check
  if (rules.states_allowed && rules.states_allowed.length > 0) {
    const userState = (profile.state || '').trim().toLowerCase();
    const isStateAllowed = rules.states_allowed.some((s) => {
      const sNorm = s.trim().toLowerCase();
      return sNorm === userState || sNorm === 'all' || sNorm === 'all india' || sNorm === 'central';
    });
    if (!isStateAllowed) {
      failures.push(`Resides in ${profile.state || 'unspecified state'}, but the scheme is only active in: ${rules.states_allowed.join(", ")}.`);
    } else {
      reasons.push(`Resides in the eligible state: ${profile.state}.`);
    }
  }

  // 4. District check
  if (rules.districts_allowed && rules.districts_allowed.length > 0) {
    const userDistrict = (profile.district || '').trim().toLowerCase();
    const isDistrictAllowed = rules.districts_allowed.some(
      (d) => d.trim().toLowerCase() === userDistrict
    );
    if (!isDistrictAllowed) {
      failures.push(`Resides in ${profile.district || 'unspecified district'} district, but the scheme is active in: ${rules.districts_allowed.join(", ")}.`);
    } else {
      reasons.push(`Resides in the eligible district: ${profile.district}.`);
    }
  }

  // 5. Gender check
  if (rules.genders_allowed && rules.genders_allowed.length > 0) {
    const userGender = (profile.gender || '').trim().toLowerCase();
    const isGenderAllowed = rules.genders_allowed.some((g) => {
      const gNorm = g.trim().toLowerCase();
      if (gNorm === userGender) return true;
      if ((gNorm === 'female' || gNorm === 'women' || gNorm === 'woman') && userGender === 'female') return true;
      if ((gNorm === 'male' || gNorm === 'men' || gNorm === 'man') && userGender === 'male') return true;
      return false;
    });
    if (!isGenderAllowed) {
      failures.push(`Gender is ${profile.gender || 'unspecified'}, but the scheme targets: ${rules.genders_allowed.join(", ")}.`);
    } else {
      reasons.push(`Gender matches eligibility requirements.`);
    }
  }

  // 6. Category check (caste/demographics)
  if (rules.categories_allowed && rules.categories_allowed.length > 0) {
    const userCat = (profile.category || '').trim().toLowerCase();
    const isCategoryAllowed = rules.categories_allowed.some(
      (c) => c.trim().toLowerCase() === userCat
    );
    if (!isCategoryAllowed) {
      failures.push(`Caste category is ${profile.category || 'unspecified'}, but the scheme is restricted to: ${rules.categories_allowed.join(", ")}.`);
    } else {
      reasons.push(`Social category ${profile.category} matches requirements.`);
    }
  }

  // 7. Disability check
  if (rules.requires_disability) {
    if (!profile.is_disabled) {
      failures.push(`Scheme is reserved exclusively for Persons with Disabilities (PwD).`);
    } else if (profile.disability_percentage < rules.min_disability_percentage) {
      failures.push(`Disability percentage is ${profile.disability_percentage}%, but the scheme requires at least ${rules.min_disability_percentage}%.`);
    } else {
      reasons.push(`Matches disability status requirement of ${rules.min_disability_percentage}%+ (User: ${profile.disability_percentage}%).`);
    }
  }

  // 8. Occupation check - Dynamic for Partially Eligible
  let occupationMatch = true;
  if (rules.occupations_allowed && rules.occupations_allowed.length > 0) {
    const userOcc = (profile.occupation || '').trim().toLowerCase();
    occupationMatch = rules.occupations_allowed.some(
      (o) => o.trim().toLowerCase() === userOcc
    );
  }

  // 9. Education check - Dynamic for Partially Eligible
  let educationMatch = true;
  if (rules.educations_allowed && rules.educations_allowed.length > 0) {
    const userEdu = (profile.education || '').trim().toLowerCase();
    educationMatch = rules.educations_allowed.some(
      (e) => e.trim().toLowerCase() === userEdu
    );
  }

  // Determine status
  if (failures.length > 0) {
    return {
      status: "ineligible",
      reasons: failures
    };
  }

  if (!occupationMatch || !educationMatch) {
    const partialReasons = [];
    if (!occupationMatch) {
      partialReasons.push(`Occupation is ${profile.occupation}, but the scheme targets: ${rules.occupations_allowed.join(", ")}.`);
    }
    if (!educationMatch) {
      partialReasons.push(`Education level is ${profile.education}, but the scheme requires: ${rules.educations_allowed.join(", ")}.`);
    }
    return {
      status: "partially_eligible",
      reasons: [
        ...reasons,
        ...partialReasons,
        "You might qualify by submitting secondary documents or declarations."
      ]
    };
  }

  return {
    status: "eligible",
    reasons: reasons.length > 0 ? reasons : ["You satisfy all criteria defined for this scheme."]
  };
};
