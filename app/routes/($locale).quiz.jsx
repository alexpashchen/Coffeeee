import {useMemo, useState} from 'react';
import {Link, useLoaderData} from 'react-router';
import {Image, Money} from '@shopify/hydrogen';

/**
 * @type {Route.MetaFunction}
 */
export const meta = () => {
  return [{title: 'Coffee Quiz'}];
};

/**
 * @param {Route.LoaderArgs} args
 */
export async function loader({context}) {
  const {storefront} = context;

  const {collection} = await storefront.query(QUIZ_PRODUCTS_QUERY, {
    variables: {
      handle: 'all-coffee',
      country: storefront.i18n.country,
      language: storefront.i18n.language,
    },
  });

  const products = (collection?.products?.nodes || [])
    .map(mapQuizProduct)
    .filter(Boolean);

  return {products};
}

const QUIZ_STEPS = [
  {
    id: 'brewMethod',
    stepLabel: 'Step 1',
    eyebrow: 'Find your coffee match',
    title: 'How do you usually brew your coffee?',
    description: `We'll use this to match you with the most suitable roast profile.`,
    options: [
      {value: 'espresso', label: 'Espresso'},
      {value: 'filter', label: 'Filter'},
      {value: 'moka', label: 'Moka pot'},
      {value: 'french_press', label: 'French press'},
      {value: 'milk_drinks', label: 'Milk drinks'},
      {value: 'not_sure', label: 'Not sure yet'},
    ],
  },
  {
    id: 'strength',
    stepLabel: 'Step 2',
    eyebrow: 'Find your coffee match',
    title: 'What strength do you prefer?',
    description: 'Choose the cup that feels closest to your daily taste.',
    options: [
      {value: 'light', label: 'Light'},
      {value: 'medium', label: 'Medium'},
      {value: 'strong', label: 'Strong'},
    ],
  },
  {
    id: 'taste',
    stepLabel: 'Step 3',
    eyebrow: 'Find your coffee match',
    title: 'Which flavour profile sounds best?',
    description: 'A simple preference is enough.',
    options: [
      {value: 'chocolatey', label: 'Chocolatey'},
      {value: 'nutty', label: 'Nutty'},
      {value: 'fruity', label: 'Fruity'},
      {value: 'balanced', label: 'Balanced'},
      {value: 'not_sure', label: 'Not sure'},
    ],
  },
  {
    id: 'acidity',
    stepLabel: 'Step 4',
    eyebrow: 'Find your coffee match',
    title: 'How much acidity is comfortable for you?',
    description: 'This helps avoid coffees that feel too sharp or too flat.',
    options: [
      {value: 'low', label: 'Low'},
      {value: 'medium', label: 'Medium'},
      {value: 'high', label: 'High'},
      {value: 'not_sure', label: 'Not sure'},
    ],
  },
  {
    id: 'experience',
    stepLabel: 'Step 5',
    eyebrow: 'Find your coffee match',
    title: 'What describes you better?',
    description:
      'We can keep it safer for beginners or more specific for experienced drinkers.',
    options: [
      {value: 'beginner', label: 'Beginner'},
      {value: 'experienced', label: 'I know what I like'},
    ],
  },
  {
    id: 'purpose',
    stepLabel: 'Step 6',
    eyebrow: 'Find your coffee match',
    title: 'What are you buying coffee for?',
    description: 'Final step.',
    options: [
      {value: 'everyday', label: 'Everyday coffee'},
      {value: 'special', label: 'Something special'},
      {value: 'gift', label: 'Gift'},
    ],
  },
];

export default function QuizRoute() {
  const {products} = useLoaderData();

  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isComplete, setIsComplete] = useState(false);

  const currentStep = QUIZ_STEPS[stepIndex];
  const currentAnswer = currentStep ? answers[currentStep.id] : null;
  const progress = Math.round(((stepIndex + 1) / QUIZ_STEPS.length) * 100);

  const rankedProducts = useMemo(() => {
    return scoreProducts(products, answers);
  }, [products, answers]);

  const bestMatch = rankedProducts[0] || null;

  function selectAnswer(stepId, value) {
    setAnswers((prev) => ({
      ...prev,
      [stepId]: value,
    }));
  }

  function goNext() {
    if (!currentAnswer) return;

    if (stepIndex === QUIZ_STEPS.length - 1) {
      setIsComplete(true);
      return;
    }

    setStepIndex((prev) => prev + 1);
  }

  function goBack() {
    if (isComplete) {
      setIsComplete(false);
      return;
    }

    setStepIndex((prev) => Math.max(prev - 1, 0));
  }

  function restartQuiz() {
    setAnswers({});
    setStepIndex(0);
    setIsComplete(false);
  }

  if (!products.length) {
    return (
      <section className="bg-[#f3efe8] px-4 py-10 md:px-6 md:py-14">
        <div className="mx-auto max-w-[760px]">
          <div className="rounded-[28px] border border-[#d9d2c7] bg-[#f7f3ed] px-6 py-10 text-center md:px-10 md:py-14">
            <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-[#7b7368]">
              Coffee Quiz
            </p>
            <h1 className="mt-4 text-3xl font-medium tracking-[-0.04em] text-[#161616] md:text-5xl">
              No quiz products found
            </h1>
            <p className="mx-auto mt-4 max-w-[520px] text-sm leading-6 text-[#666055] md:text-base">
              Add products with quiz metafields to your collection and the quiz
              will start working.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-[#f3efe8] px-4 py-8 md:px-6 md:py-12">
      <div className="mx-auto max-w-[780px]">
        {!isComplete ? (
          <div className="rounded-[28px] border border-[#1b1b1b] bg-[#f7f3ed] px-6 py-6 md:px-10 md:py-8">
            <div className="flex items-center justify-between gap-4">
              <Link
                to="/"
                className="text-[11px] font-medium uppercase tracking-[0.22em] text-[#1b1b1b] transition hover:opacity-70"
              >
                Back to shop
              </Link>

              <span className="text-[11px] font-medium uppercase tracking-[0.22em] text-[#1b1b1b]">
                {currentStep.stepLabel}
              </span>
            </div>

            <div className="mt-6 h-[2px] w-full overflow-hidden rounded-full bg-[#e4ddd2]">
              <div
                className="h-full rounded-full bg-[#1b1b1b] transition-all duration-300"
                style={{width: `${progress}%`}}
              />
            </div>

            <div className="mt-8">
              <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-[#7b7368]">
                {currentStep.eyebrow}
              </p>

              <h1 className="mt-4 max-w-[640px] text-[34px] font-medium leading-[1.02] tracking-[-0.05em] text-[#161616] md:text-[56px]">
                {currentStep.title}
              </h1>

              <p className="mt-4 max-w-[560px] text-[15px] leading-7 text-[#605a51] md:text-[17px]">
                {currentStep.description}
              </p>
            </div>

            <div className="mt-10 grid gap-3 sm:grid-cols-2">
              {currentStep.options.map((option) => {
                const isSelected = currentAnswer === option.value;

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => selectAnswer(currentStep.id, option.value)}
                    className={[
                      'inline-flex min-h-[56px] items-center justify-center rounded-full border px-5 text-center text-[17px] font-medium transition md:min-h-[58px]',
                      isSelected
                        ? 'border-[#1b1b1b] bg-[#1b1b1b] text-white'
                        : 'border-[#1b1b1b] bg-transparent text-[#1b1b1b] hover:bg-[#ede7dd]',
                    ].join(' ')}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>

            <div className="mt-10 flex items-center justify-center gap-4">
              <div>
                {stepIndex > 0 ? (
                  <button
                    type="button"
                    onClick={goBack}
                    className="inline-flex h-[46px] items-center justify-center rounded-full border border-[#1b1b1b] px-6 text-sm font-medium text-[#1b1b1b] transition hover:bg-[#ede7dd]"
                  >
                    Back
                  </button>
                ) : (
                  <div className="h-[46px]" />
                )}
              </div>

              <button
                type="button"
                onClick={goNext}
                disabled={!currentAnswer}
                className="next-btn inline-flex h-[50px] items-center justify-center rounded-full bg-[#1b1b1b] px-6 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-35"
              >
                {stepIndex === QUIZ_STEPS.length - 1
                  ? 'Get recommendation'
                  : 'Continue'}
              </button>
            </div>
          </div>
        ) : (
          <div className="rounded-[28px] border border-[#1b1b1b] bg-[#f7f3ed] p-6 md:p-8">
            <div className="grid gap-6 md:grid-cols-[0.88fr_1.12fr]">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-[#7b7368]">
                  Your result
                </p>

                <h1 className="mt-4 text-[34px] font-medium leading-[1.02] tracking-[-0.05em] text-[#161616] md:text-[52px]">
                  Your best coffee match
                </h1>

                <p className="mt-4 max-w-[420px] text-[15px] leading-7 text-[#605a51] md:text-[17px]">
                  Based on your brewing style and taste preferences, this is the
                  strongest overall fit.
                </p>

                <div className="mt-8 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={restartQuiz}
                    className="inline-flex h-[46px] items-center justify-center rounded-full border border-[#1b1b1b] px-6 text-sm font-medium text-[#1b1b1b] transition hover:bg-[#ede7dd]"
                  >
                    Retake quiz
                  </button>

                  <button
                    type="button"
                    onClick={goBack}
                    className="inline-flex h-[46px] items-center justify-center rounded-full bg-[#1b1b1b] px-6 text-sm font-medium text-white transition hover:opacity-90"
                  >
                    Back
                  </button>
                </div>
              </div>

              <div className="overflow-hidden rounded-[24px] border border-[#ddd5ca] bg-white">
                {bestMatch ? (
                  <div className="grid h-full md:grid-cols-[1fr]">
                    <div className="bg-[#f1ece4]">
                      {bestMatch.image ? (
                        <Image
                          data={bestMatch.image}
                          sizes="(min-width: 768px) 320px, 100vw"
                          aspectRatio="1/1"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="aspect-square h-full w-full bg-[#ece5da]" />
                      )}
                    </div>

                    <div className="flex flex-col p-6">
                      <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-[#7b7368]">
                        Recommended coffee
                      </p>

                      <h2 className="mt-3 text-[30px] font-medium leading-tight tracking-[-0.04em] text-[#161616] md:text-[38px]">
                        {bestMatch.title}
                      </h2>

                      {bestMatch.price ? (
                        <div className="mt-4 text-base font-medium text-[#161616]">
                          <Money data={bestMatch.price} />
                        </div>
                      ) : null}

                      <p className="mt-5 text-[15px] leading-7 text-[#605a51] md:text-base">
                        {buildRecommendationCopy(bestMatch, answers)}
                      </p>

                      <div className="mt-6 flex flex-wrap gap-2">
                        {bestMatch.roastLevel ? (
                          <ResultTag>{labelize(bestMatch.roastLevel)}</ResultTag>
                        ) : null}
                        {bestMatch.acidity ? (
                          <ResultTag>
                            {labelize(bestMatch.acidity)} acidity
                          </ResultTag>
                        ) : null}
                        {bestMatch.flavorProfile?.slice(0, 2).map((note) => (
                          <ResultTag key={note}>{labelize(note)}</ResultTag>
                        ))}
                      </div>

                      <div className="mt-auto pt-8">
                        <Link
                          to={bestMatch.url}
                          className="inline-flex h-[50px] items-center justify-center rounded-full bg-[#1b1b1b] px-6 text-sm font-medium text-white transition hover:opacity-90"
                        >
                          View product
                        </Link>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-8">
                    <p className="text-sm leading-6 text-[#605a51]">
                      No suitable match was found. Try retaking the quiz.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function ResultTag({children}) {
  return (
    <span className="inline-flex rounded-full border border-[#d9d1c6] bg-[#f6f2eb] px-3 py-2 text-[11px] font-medium uppercase tracking-[0.14em] text-[#6b6459]">
      {children}
    </span>
  );
}

function mapQuizProduct(product) {
  if (!product?.handle) return null;

  return {
    id: product.id,
    title: product.title,
    handle: product.handle,
    url: `/products/${product.handle}`,
    image: product.featuredImage || null,
    price: product.priceRange?.minVariantPrice || null,
    roastLevel: getAliasedMetafieldValue(product, 'roast_level'),
    flavorProfile: parseListMetafield(
      getAliasedMetafieldValue(product, 'flavor_profile'),
    ),
    acidity: getAliasedMetafieldValue(product, 'acidity'),
    intensity: normalizeIntensity(getAliasedMetafieldValue(product, 'intensity')),
    brewMethods: parseListMetafield(
      getAliasedMetafieldValue(product, 'brew_methods'),
    ),
    beginnerFriendly:
      getAliasedMetafieldValue(product, 'beginner_friendly') === 'true',
    bestFor: parseListMetafield(getAliasedMetafieldValue(product, 'best_for')),
  };
}

function getAliasedMetafieldValue(product, key) {
  return product?.[key]?.value ?? null;
}

function parseListMetafield(value) {
  if (!value) return [];

  try {
    const parsed = JSON.parse(value);

    if (Array.isArray(parsed)) {
      return parsed.map((item) => String(item).trim().toLowerCase());
    }
  } catch {
    // ignore
  }

  return String(value)
    .split(',')
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
}

function normalizeIntensity(value) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : 3;
}

function hasAny(source, targets) {
  return targets.some((target) => source.includes(target));
}

function labelize(value) {
  return String(value).replaceAll('_', ' ');
}

function scoreProducts(products, answers) {
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

function buildRecommendationCopy(product, answers) {
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

const QUIZ_PRODUCTS_QUERY = `#graphql
  query QuizProducts(
    $handle: String!
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    collection(handle: $handle) {
      id
      title
      products(first: 50) {
        nodes {
          id
          handle
          title
          featuredImage {
            id
            url
            altText
            width
            height
          }
          priceRange {
            minVariantPrice {
              amount
              currencyCode
            }
          }
          roast_level: metafield(namespace: "custom", key: "roast_level") {
            value
          }
          flavor_profile: metafield(namespace: "custom", key: "flavor_profile") {
            value
          }
          acidity: metafield(namespace: "custom", key: "acidity") {
            value
          }
          intensity: metafield(namespace: "custom", key: "intensity") {
            value
          }
          brew_methods: metafield(namespace: "custom", key: "brew_methods") {
            value
          }
          beginner_friendly: metafield(namespace: "custom", key: "beginner_friendly") {
            value
          }
          best_for: metafield(namespace: "custom", key: "best_for") {
            value
          }
        }
      }
    }
  }
`;