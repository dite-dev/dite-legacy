import { defineComponent } from 'vue';

export default defineComponent({
  name: 'About',
  setup() {
    return () => {
      return (
        <div className="about">
          <h1>This is an about page</h1>
        </div>
      );
    };
  },
});
