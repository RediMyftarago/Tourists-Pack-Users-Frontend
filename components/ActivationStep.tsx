export const ActivationStep = ({
  number,
  title,
  text,
}: {
  number: string;
  title: string;
  text: string;
}) => (
  <div className="step bg-white dark:bg-black text-black dark:text-white">
    How to Activate
    <div className="step-number">{number}</div>
    <h3 className="step-title">{title}</h3>
    <p className="step-text">{text}</p>
  </div>
);
