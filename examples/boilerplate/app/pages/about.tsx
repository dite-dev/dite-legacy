const About = () => {
  const onClick = () => {
    console.log(1);
  };
  return (
    <div>
      <button onClick={onClick} type="button">
        About
      </button>
    </div>
  );
};

export default About;
