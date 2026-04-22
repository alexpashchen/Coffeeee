import {useMemo, useState} from 'react';
import {Link, useLoaderData} from 'react-router';
import {Image, Money} from '@shopify/hydrogen';
import {QUIZ_STEPS} from '~/lib/quizSteps';
import {QUIZ_PRODUCTS_QUERY, mapQuizProduct} from '~/lib/quizProductsQuery';
import {scoreProducts, buildRecommendationCopy} from '~/lib/quizScoring';

/**
 * @type {Route.MetaFunction}
 */
export const meta = () => {
  return {
    title: 'Coffee Quiz',
    description: 'Find your perfect coffee match with our quiz!',
  }; 
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

function labelize(value) {
  return String(value).replaceAll('_', ' ');
}