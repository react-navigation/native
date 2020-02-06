import React from 'react';
import { TextInput, UIManager } from 'react-native';

export default (Navigator, navigatorConfig) =>
  class KeyboardAwareNavigator extends React.Component {
    static router = Navigator.router;
    static navigationOptions = Navigator.navigationOptions;
    _previouslyFocusedTextInput = null;

    render() {
      return (
        <Navigator
          {...this.props}
          onGestureBegin={this._handleGestureBegin}
          onGestureCanceled={this._handleGestureCanceled}
          onGestureEnd={this._handleGestureEnd}
          onTransitionStart={this._handleTransitionStart}
        />
      );
    }

    _handleGestureBegin = () => {
      this._previouslyFocusedTextInput = TextInput.State.currentlyFocusedField();
      if (this._previouslyFocusedTextInput) {
        TextInput.State.blurTextInput(this._previouslyFocusedTextInput);
      }
      this.props.onGestureBegin && this.props.onGestureBegin();
    };

    _handleGestureCanceled = () => {
      if (this._previouslyFocusedTextInput) {
        TextInput.State.focusTextInput(this._previouslyFocusedTextInput);
      }
      this.props.onGestureCanceled && this.props.onGestureCanceled();
    };

    _handleGestureEnd = () => {
      this._previouslyFocusedTextInput = null;
      this.props.onGestureFinish && this.props.onGestureFinish();
    };

    _handleTransitionStart = (transitionProps, prevTransitionProps) => {
      // TODO: We should not even have received the transition start event
      // in the case where the index did not change, I believe. We
      // should revisit this after 2.0 release.
      if (transitionProps.index !== prevTransitionProps.index) {
        const currentFocusedField = TextInput.State.currentlyFocusedField();
        if (currentFocusedField) {
          const previousSceneTag =
            prevTransitionProps &&
            prevTransitionProps.scene &&
            prevTransitionProps.scene.route &&
            prevTransitionProps.scene.route.params &&
            prevTransitionProps.scene.route.params.nodeTag;
          if (previousSceneTag) {
            UIManager.viewIsDescendantOf(
              currentFocusedField,
              previousSceneTag,
              isDescendant => {
                if (isDescendant)
                  TextInput.State.blurTextInput(currentFocusedField);
              }
            );
          } else {
            TextInput.State.blurTextInput(currentFocusedField);
          }
        }
      }

      const onTransitionStart =
        this.props.onTransitionStart || navigatorConfig.onTransitionStart;
      onTransitionStart &&
        onTransitionStart(transitionProps, prevTransitionProps);
    };
  };
