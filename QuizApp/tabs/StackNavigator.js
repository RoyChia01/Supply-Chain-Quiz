import { createStackNavigator } from '@react-navigation/stack';
import QuizTopics from '../tabs/QuizTopics';
import QuizQuestions from '../tabs/QuizQuestions'; // Make sure you import QuizQuestions

const Stack = createStackNavigator();

const StackNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="QuizTopics" component={QuizTopics} />
      <Stack.Screen name="QuizQuestions" component={QuizQuestions} />
    </Stack.Navigator>
  );
};
export default StackNavigator;