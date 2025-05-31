import { FeatureItem } from './feature-item';
import { features } from '@/src/constants/features';

export const MarketingFeaturesSection = () => {
  return (
    <section className="m-2 bg-transparent py-[72px] text-white" id="features">
      <div className="container">
        <h2 className="mx-auto mt-3 mb-6 max-w-3xl text-center text-3xl font-black md:text-5xl md:leading-none">
          Features
        </h2>
        <p className="mx-auto mt-5 max-w-2xl text-center text-lg font-extrabold tracking-wider text-white/70 uppercase md:text-xl">
          Everything you need to explore the blockchain — through a simple
          conversation.
        </p>
        <div className="mt-16 flex flex-col gap-4">
          <div className="flex flex-row gap-4">
            {features.slice(0, 3).map(({ title, description, icon }) => (
              <FeatureItem
                key={title}
                title={title}
                description={description}
                icon={icon}
              />
            ))}
          </div>
          <div className="flex flex-row gap-4">
            {features.slice(3, 6).map(({ title, description, icon }) => (
              <FeatureItem
                key={title}
                title={title}
                description={description}
                icon={icon}
              />
            ))}
          </div>
          <div className="flex flex-row gap-4">
            {features.slice(6).map(({ title, description, icon }) => (
              <FeatureItem
                key={title}
                title={title}
                description={description}
                icon={icon}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
