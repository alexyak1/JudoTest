export const CATEGORIES = ['U9','U11','U13','U15','U18','U21','Senior','M1','M2','M3','M4','M5','M6','M7','M8','M9'];

const U13_BOYS = ['-34','-38','-42','-46','-50','-60'];
const U13_GIRLS = ['-32','-36','-40','-44','-48','-51','+60'];
const CADET_BOYS = ['-50','-55','-60','-66','-73','-81','-90','+90'];
const CADET_GIRLS = ['-40','-44','-48','-52','-57','-63','-70','+70'];
const SENIOR_MEN = ['-60','-66','-73','-81','-90','-100','+100'];
const SENIOR_WOMEN = ['-48','-52','-57','-63','-70','-78','+78'];

export const getWeightClasses = (category, gender) => {
    const cat = (category || '').trim().toUpperCase();
    const g = (gender || '').toLowerCase();

    if (cat === 'U13') {
        if (g === 'male') return { boys: U13_BOYS };
        if (g === 'female') return { girls: U13_GIRLS };
        return { boys: U13_BOYS, girls: U13_GIRLS };
    }

    const isCadet = ['U9','U11','U15','U18'].includes(cat);
    if (isCadet) {
        if (g === 'male') return { boys: CADET_BOYS };
        if (g === 'female') return { girls: CADET_GIRLS };
        return { boys: CADET_BOYS, girls: CADET_GIRLS };
    }
    if (g === 'male') return { men: SENIOR_MEN };
    if (g === 'female') return { women: SENIOR_WOMEN };
    return { men: SENIOR_MEN, women: SENIOR_WOMEN };
};
