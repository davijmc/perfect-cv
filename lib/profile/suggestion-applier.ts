import { UserProfile, ProfileSuggestionItem } from '../ai/schemas';

/**
 * Aplica determinística e imutavelmente uma sugestão da IA no perfil do usuário.
 * Pode receber um `customValue` opcional caso o usuário tenha editado a sugestão antes de aprovar.
 */
export function applySuggestionToProfile(
  profile: UserProfile,
  suggestion: ProfileSuggestionItem,
  customValue?: string
): UserProfile {
  // Clona profundamente o perfil para garantir imutabilidade
  const updated: UserProfile = JSON.parse(JSON.stringify(profile));
  const finalValue = (customValue !== undefined ? customValue : suggestion.suggestedValue).trim();

  switch (suggestion.type) {
    case 'add_skill': {
      const category = suggestion.skillCategory || 'technical';
      const list = updated.skills[category] || [];
      const lower = finalValue.toLowerCase();
      // Não adiciona se já existir (case-insensitive)
      if (!list.some((s) => s.toLowerCase() === lower)) {
        updated.skills[category] = [...list, finalValue];
      }
      break;
    }

    case 'remove_skill': {
      const category = suggestion.skillCategory || 'technical';
      const list = updated.skills[category] || [];
      const lower = finalValue.toLowerCase();
      updated.skills[category] = list.filter((s) => s.toLowerCase() !== lower);
      break;
    }

    case 'improve_summary':
    case 'grammar_style': {
      if (suggestion.targetField === 'summary' || suggestion.targetField === 'personalInfo.summary') {
        updated.summary = finalValue;
      } else if (
        suggestion.targetField === 'experiences.highlight' &&
        suggestion.targetIndex !== undefined &&
        suggestion.subIndex !== undefined
      ) {
        if (
          updated.experiences[suggestion.targetIndex] &&
          updated.experiences[suggestion.targetIndex].highlights[suggestion.subIndex] !== undefined
        ) {
          updated.experiences[suggestion.targetIndex].highlights[suggestion.subIndex] = finalValue;
        }
      }
      break;
    }

    case 'improve_highlight': {
      if (
        suggestion.targetIndex !== undefined &&
        suggestion.subIndex !== undefined &&
        updated.experiences[suggestion.targetIndex] &&
        updated.experiences[suggestion.targetIndex].highlights[suggestion.subIndex] !== undefined
      ) {
        updated.experiences[suggestion.targetIndex].highlights[suggestion.subIndex] = finalValue;
      }
      break;
    }

    default:
      break;
  }

  return updated;
}

/**
 * Reverte uma sugestão que havia sido aplicada no perfil.
 */
export function revertSuggestionFromProfile(
  profile: UserProfile,
  suggestion: ProfileSuggestionItem
): UserProfile {
  const updated: UserProfile = JSON.parse(JSON.stringify(profile));

  switch (suggestion.type) {
    case 'add_skill': {
      // Reverter adição = remover
      const category = suggestion.skillCategory || 'technical';
      const list = updated.skills[category] || [];
      const lower = suggestion.suggestedValue.toLowerCase();
      updated.skills[category] = list.filter((s) => s.toLowerCase() !== lower);
      break;
    }

    case 'remove_skill': {
      // Reverter remoção = readicionar
      const category = suggestion.skillCategory || 'technical';
      const list = updated.skills[category] || [];
      if (!list.includes(suggestion.suggestedValue)) {
        updated.skills[category] = [...list, suggestion.suggestedValue];
      }
      break;
    }

    case 'improve_summary':
    case 'grammar_style': {
      if (suggestion.targetField === 'summary' || suggestion.targetField === 'personalInfo.summary') {
        updated.summary = suggestion.originalValue || '';
      } else if (
        suggestion.targetField === 'experiences.highlight' &&
        suggestion.targetIndex !== undefined &&
        suggestion.subIndex !== undefined
      ) {
        if (
          updated.experiences[suggestion.targetIndex] &&
          updated.experiences[suggestion.targetIndex].highlights[suggestion.subIndex] !== undefined
        ) {
          updated.experiences[suggestion.targetIndex].highlights[suggestion.subIndex] = suggestion.originalValue || '';
        }
      }
      break;
    }

    case 'improve_highlight': {
      if (
        suggestion.targetIndex !== undefined &&
        suggestion.subIndex !== undefined &&
        updated.experiences[suggestion.targetIndex] &&
        updated.experiences[suggestion.targetIndex].highlights[suggestion.subIndex] !== undefined
      ) {
        updated.experiences[suggestion.targetIndex].highlights[suggestion.subIndex] = suggestion.originalValue || '';
      }
      break;
    }

    default:
      break;
  }

  return updated;
}
