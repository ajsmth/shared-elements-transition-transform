import React from 'react';

import {
  SharedElement as RNSharedElement,
  SharedElementTransition,
  nodeFromRef,
  SharedElementAlign,
  SharedElementAnimation,
  SharedElementResize,
  SharedElementNode,
} from 'react-native-shared-element';

import {StyleSheet, Animated, View} from 'react-native';

const IndexContext = React.createContext(-1);
const AnimatedIndexContext = React.createContext(new Animated.Value(0));
const TransitionContext = React.createContext<any>({
  registerAncestor: () => {},
  registerElement: () => {},
});

interface ISharedElementConfig {
  align?: SharedElementAlign;
  resize?: SharedElementResize;
  animated?: SharedElementAnimation;
  debug?: boolean;
}

const DEFAULT_ELEMENT_CONFIG: ISharedElementConfig = {
  align: 'auto',
  resize: 'auto',
  animated: 'move',
  debug: false,
};

interface ISharedElements {
  activeIndex: number;
  animatedIndex: Animated.Value;
  transitionConfig?: ITransitionConfig;
  children: React.ReactNode;
}

function SharedElements({
  activeIndex,
  animatedIndex,
  transitionConfig = DEFAULT_TRANSITION_CONFIG,
  children,
}: ISharedElements) {
  const transitionMethod =
    // @ts-ignore
    transitionConfig['duration'] !== undefined ? 'timing' : 'spring';

  const {transitions, ancestors, configs} = React.useContext(TransitionContext);

  const position = React.useRef(new Animated.Value(0));

  const [currentIndex, setCurrentIndex] = React.useState(activeIndex);
  const [nextIndex, setNextIndex] = React.useState(activeIndex);

  React.useEffect(() => {
    setNextIndex(activeIndex);
  }, [activeIndex]);

  const previousIndex = usePrevious(activeIndex);

  const transitioning =
    nextIndex !== currentIndex || previousIndex !== activeIndex;

  function renderTransitions() {
    if (currentIndex === nextIndex) {
      return null;
    }

    position.current.setValue(0);

    const nodes = Object.keys(transitions)
      .map(transitionId => {
        const transition = transitions[transitionId];
        const startNode = transition[currentIndex];
        const endNode = transition[nextIndex];

        if (startNode && startNode.ref && endNode && endNode.ref) {
          const startAncestor = ancestors[currentIndex];
          const endAncestor = ancestors[nextIndex];

          const elementConfigs = configs[transitionId];
          let elementConfig;

          if (elementConfigs) {
            elementConfig = elementConfigs[currentIndex];
          }

          elementConfig = elementConfig || DEFAULT_ELEMENT_CONFIG;

          if (startAncestor && endAncestor) {
            return (
              <Animated.View
                key={transitionId}
                style={{
                  ...StyleSheet.absoluteFillObject,
                  zIndex: 1000,
                }}>
                <SharedElementTransition
                  start={{
                    node: startNode,
                    ancestor: startAncestor,
                  }}
                  end={{
                    node: endNode,
                    ancestor: endAncestor,
                  }}
                  position={position.current}
                  {...elementConfig}
                />
              </Animated.View>
            );
          }
        }

        return null;
      })
      .filter(Boolean);

    if (nodes.length > 0) {
      Animated.parallel([
        Animated[transitionMethod](position.current, {
          ...transitionConfig,
          toValue: 1,
        }),
        Animated[transitionMethod](animatedIndex, {
          ...transitionConfig,
          toValue: nextIndex,
        }),
      ]).start(() => {
        setCurrentIndex(nextIndex);
      });
    }

    return nodes;
  }

  return (
    <AnimatedIndexContext.Provider value={animatedIndex}>
      {React.Children.map(children, (child: any, index: number) => {
        if (!transitioning) {
          if (index > activeIndex) {
            return null;
          }
        }

        return (
          <IndexContext.Provider value={index}>
            <SharedElementScreen>{child}</SharedElementScreen>
          </IndexContext.Provider>
        );
      })}

      {renderTransitions()}
    </AnimatedIndexContext.Provider>
  );
}

interface ISharedElementScreen {
  children: React.ReactNode;
}

function SharedElementScreen({children}: ISharedElementScreen) {
  const index = React.useContext(IndexContext);
  const {registerAncestor} = React.useContext(TransitionContext);

  return (
    <View
      collapsable={false}
      style={{
        ...StyleSheet.absoluteFillObject,
      }}
      ref={ref => registerAncestor(ref, index)}>
      {children}
    </View>
  );
}

interface ISharedElement {
  children: React.ReactNode;
  id: string;
  config?: ISharedElementConfig;
}

function SharedElement({children, id, config}: ISharedElement) {
  const index = React.useContext(IndexContext);

  const {registerElement} = React.useContext(TransitionContext);

  return (
    <RNSharedElement onNode={node => registerElement(node, index, id, config)}>
      <View collapsable={false}>{children}</View>
    </RNSharedElement>
  );
}

type ITransitionConfig =
  | Partial<Animated.SpringAnimationConfig>
  | Partial<Animated.TimingAnimationConfig>;

const DEFAULT_TRANSITION_CONFIG: ITransitionConfig = {
  stiffness: 1000,
  damping: 500,
  mass: 3,
  overshootClamping: false,
  restDisplacementThreshold: 0.01,
  restSpeedThreshold: 0.01,
  useNativeDriver: true,
};

function usePrevious(value: any) {
  // The ref object is a generic container whose current property is mutable ...
  // ... and can hold any value, similar to an instance property on a class
  const ref = React.useRef<any>(value);

  // Store current value in ref
  React.useEffect(() => {
    ref.current = value;
  }, [value]); // Only re-run if value changes

  // Return previous value (happens before update in useEffect above)
  return ref.current;
}

function SharedElementsContainer({
  children,
  activeIndex,
  animatedIndex,
  transitionConfig,
}: any) {
  return (
    <TransitionContextProvider>
      <SharedElements
        activeIndex={activeIndex}
        animatedIndex={animatedIndex}
        transitionConfig={transitionConfig}>
        {children}
      </SharedElements>
    </TransitionContextProvider>
  );
}

interface ITransitionContextProvider {
  children: React.ReactNode;
}

function TransitionContextProvider({children}: ITransitionContextProvider) {
  const ancestors = React.useRef([]);
  const transitions = React.useRef<Record<string, SharedElementNode[]>>({});
  const configs = React.useRef<Record<string, ISharedElementConfig[]>>({});

  function registerAncestor(ref: any, index: number) {
    const node = nodeFromRef(ref);
    if (node) {
      // @ts-ignore
      ancestors.current[index] = node;
    }
  }

  function registerElement(
    node: any,
    index: number,
    id: string,
    config?: ISharedElementConfig,
  ) {
    if (!transitions.current[id]) {
      transitions.current[id] = [];
    }

    if (node) {
      transitions.current[id][index] = node;
    }

    if (!configs.current[id]) {
      configs.current[id] = [];
    }

    configs.current[id][index] = {
      ...DEFAULT_ELEMENT_CONFIG,
      ...config,
    };
  }

  return (
    <TransitionContext.Provider
      value={{
        ancestors: ancestors.current,
        registerAncestor,
        transitions: transitions.current,
        registerElement,
        configs: configs.current,
      }}>
      {children}
    </TransitionContext.Provider>
  );
}
export {SharedElement, SharedElementsContainer as SharedElements};
