export function scoreProducts(products, answers) {
  return [...products]
    .map((product) => {
      let score = 0;

      if (answers.brewMethod === 'espresso') {
        if (product.brewMethods.includes('espresso')) score += 4;
        if (product.brewMethods.includes('moka')) score += 1;
        if (product.brewMethods.includes('milk_drinks')) score += 1;
      }

      if (answers.brewMethod === 'filter') {
        if (product.brewMethods.includes('filter')) score += 4;
        if (product.brewMethods.includes('french_press')) score += 1;
      }

      if (answers.brewMethod === 'moka') {
        if (product.brewMethods.includes('moka')) score += 4;
        if (product.brewMethods.includes('espresso')) score += 1;
      }

      if (answers.brewMethod === 'french_press') {
        if (product.brewMethods.includes('french_press')) score += 4;
        if (product.brewMethods.includes('filter')) score += 1;
      }

      if (answers.brewMethod === 'milk_drinks') {
        if (product.brewMethods.includes('milk_drinks')) score += 4;
        if (product.brewMethods.includes('espresso')) score += 2;
        if (product.roastLevel === 'dark') score += 1;
      }

      if (answers.brewMethod === 'not_sure') {
        if (product.beginnerFriendly) score += 2;
        if (product.bestFor.includes('everyday')) score += 2;
      }

      if (answers.strength === 'light') {
        if (product.roastLevel === 'light') score += 3;
        if (product.intensity <= 2) score += 2;
      }

      if (answers.strength === 'medium') {
        if (product.roastLevel === 'medium') score += 3;
        if (product.intensity === 3) score += 2;
      }

      if (answers.strength === 'strong') {
        if (product.roastLevel === 'dark') score += 3;
        if (product.intensity >= 4) score += 2;
      }

      if (answers.taste === 'chocolatey') {
        if (hasAny(product.flavorProfile, ['chocolate', 'cocoa', 'caramel'])) {
          score += 4;
        }
      }

      if (answers.taste === 'nutty') {
        if (hasAny(product.flavorProfile, ['nutty', 'nuts', 'almond', 'hazelnut'])) {
          score += 4;
        }
      }

      if (answers.taste === 'fruity') {
        if (hasAny(product.flavorProfile, ['fruity', 'berry', 'citrus', 'floral'])) {
          score += 4;
        }
      }

      if (answers.taste === 'balanced') {
        if (product.flavorProfile.includes('balanced')) score += 4;
        if (product.beginnerFriendly) score += 1;
      }

      if (answers.taste === 'not_sure') {
        if (product.beginnerFriendly) score += 2;
        if (product.bestFor.includes('everyday')) score += 1;
      }

      if (answers.acidity === 'low') {
        if (product.acidity === 'low') score += 4;
        if (product.acidity === 'medium') score += 1;
      }

      if (answers.acidity === 'medium') {
        if (product.acidity === 'medium') score += 4;
      }

      if (answers.acidity === 'high') {
        if (product.acidity === 'high') score += 4;
        if (hasAny(product.flavorProfile, ['fruity', 'citrus', 'berry'])) {
          score += 1;
        }
      }

      if (answers.acidity === 'not_sure') {
        if (product.acidity === 'low') score += 2;
        if (product.beginnerFriendly) score += 1;
      }

      if (answers.experience === 'beginner') {
        if (product.beginnerFriendly) score += 4;
        if (product.acidity === 'high') score -= 2;
        if (product.bestFor.includes('everyday')) score += 1;
      }

      if (answers.experience === 'experienced') {
        if (product.acidity === 'high') score += 1;
        if (product.bestFor.includes('special')) score += 2;
      }

      if (answers.purpose === 'everyday') {
        if (product.bestFor.includes('everyday')) score += 4;
        if (product.beginnerFriendly) score += 1;
      }

      if (answers.purpose === 'special') {
        if (product.bestFor.includes('special')) score += 4;
        if (answers.experience === 'experienced') score += 1;
      }

      if (answers.purpose === 'gift') {
        if (product.bestFor.includes('gift')) score += 4;
        if (product.flavorProfile.includes('balanced')) score += 1;
      }

      return {
        ...product,
        quizScore: score,
      };
    })
    .sort((a, b) => {
      if (b.quizScore !== a.quizScore) return b.quizScore - a.quizScore;
      if (a.beginnerFriendly !== b.beginnerFriendly) {
        return a.beginnerFriendly ? -1 : 1;
      }
      return a.title.localeCompare(b.title);
    });
}

export function buildRecommendationCopy(product, answers) {
  const parts = [];

  if (answers.brewMethod && answers.brewMethod !== 'not_sure') {
    parts.push(
      `This coffee fits ${labelize(answers.brewMethod).toLowerCase()} brewing particularly well.`,
    );
  }

  if (answers.taste && answers.taste !== 'not_sure') {
    parts.push(
      `Its flavour profile leans ${labelize(answers.taste).toLowerCase()}, which matches your preference.`,
    );
  }

  if (answers.acidity && answers.acidity !== 'not_sure' && product.acidity) {
    parts.push('It also stays close to your preferred acidity level.');
  }

  if (answers.experience === 'beginner' && product.beginnerFriendly) {
    parts.push('It should also feel accessible and easy to enjoy as a starting point.');
  }

  if (!parts.length) {
    parts.push(
      'This product scored highest across your answers and looks like the most suitable overall recommendation.',
    );
  }

  return parts.join(' ');
}

export function labelize(value) {
  return String(value).replaceAll('_', ' ');
}

function hasAny(source, targets) {
  return targets.some((target) => source.includes(target));
}