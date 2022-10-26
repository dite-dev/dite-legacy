import { defineComponent } from 'vue';

export default defineComponent({
  name: 'Home',
  setup() {
    const onClick = () => {
      console.log(1);
    };
    return () => {
      return (
        <div>
          <button onClick={onClick} type="button">
            Hello World!
          </button>
        </div>
      );
    };
  },
});
