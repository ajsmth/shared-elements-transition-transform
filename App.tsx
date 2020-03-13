import React from 'react';
import {
  SafeAreaView,
  View,
  TouchableOpacity,
  Text,
  Image,
  Animated,
} from 'react-native';
import {SharedElements, SharedElement} from './shared-elements';

const imageUris = [
  'https://images.unsplash.com/photo-1583940447650-4ad880bec532?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=2550&q=80',
  'https://images.unsplash.com/photo-1558981000-f294a6ed32b2?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=2550&q=80',
  'https://images.unsplash.com/photo-1584036937843-e5fcfd590096?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1511&q=80',
  'https://images.unsplash.com/photo-1584034256047-741246c713e8?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1581&q=80',
];

function Screen1() {
  return (
    <View style={{flex: 1}}>
      <View style={{alignItems: 'center'}}>
        <SharedElement id="image" config={{ debug: true }}>
          <Image
            style={{height: 200, width: 400 }}
            source={{uri: imageUris[1]}}
          />
        </SharedElement>
      </View>
    </View>
  );
}

function Screen2() {
  return (
    <View style={{flex: 1}}>
      <SharedElement id="image" config={{ debug: true }}>
        <Image
          style={{height: 600, width: '100%'}}
          source={{uri: imageUris[1]}}
        />
      </SharedElement>
    </View>
  );
}

function Example() {
  const [activeIndex, setActiveIndex] = React.useState(0);
  const animatedIndex = React.useRef(new Animated.Value(0));

  return (
    <SafeAreaView style={{flex: 1}}>
      <View style={{flex: 1}}>
        <SharedElements
          transitionConfig={{ duration: 2000 }}
          activeIndex={activeIndex}
          animatedIndex={animatedIndex.current}>
          <Screen1 />
          <Screen2 />
        </SharedElements>
      </View>

      <View style={{flexDirection: 'row', backgroundColor: 'white'}}>
        <TouchableOpacity
          style={{
            flex: 1,
            height: 50,
            borderWidth: 1,
            justifyContent: 'center',
            alignItems: 'center',
          }}
          onPress={() => setActiveIndex(activeIndex - 1)}>
          <Text>Decrement</Text>
        </TouchableOpacity>

        <View
          style={{height: 50, marginHorizontal: 10, justifyContent: 'center'}}>
          <Text>{`activeIndex: ${activeIndex}`}</Text>
        </View>

        <TouchableOpacity
          style={{
            flex: 1,
            height: 50,
            borderWidth: 1,
            justifyContent: 'center',
            alignItems: 'center',
          }}
          onPress={() => setActiveIndex(activeIndex + 1)}>
          <Text>Increment</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function App() {
  return (
    <View style={{flex: 1}}>
      {/* <View style={{ height: 500, borderWidth: 1}}>
        <Text style={{ fontSize: 20, fontWeight: '800', textAlign: 'center'}}>Example</Text>
        <Example />
      </View> */}


      <View style={{ height: 500, borderWidth: 1, transform: [{translateY: 100 }]}}>
        <Text style={{ fontSize: 20, fontWeight: '800', textAlign: 'center'}}>Transform Y Example</Text>
        <Example />
      </View>
    </View>
  );
}

export default App;
