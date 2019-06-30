import React, { Component } from "react";
import PropTypes from "prop-types";
import { View, Modal, TouchableOpacity, Animated, PanResponder, Text } from "react-native";
import styles from "./styles";

const SUPPORTED_ORIENTATIONS = [
    "portrait",
    "portrait-upside-down",
    "landscape",
    "landscape-left",
    "landscape-right"
];

class Sheeter extends Component {
    constructor(props) {
        super(props);
        this.state = {
            modalVisible: false,
            animatedSize: new Animated.Value(0),
            pan: new Animated.ValueXY()
        };

        this.createPanResponder(props);
    }

    isSide = () => {
        const { type } = this.props;
        if (type === "right" || type === "left") {
            return true;
        }
        else {
            return false;
        }
    }

    onPanResponderReleaseControl = (size, gestureState) => {
        if (this.isSide()) {
            if (size / 4 - gestureState.dx < 0) {
                return true;
            }
            else return false
        }
        else {
            if (size / 4 - gestureState.dy < 0) {
                return true;
            }
            else return false
        }
    }

    setModalVisible(visible) {
        const { size, minClosingSize, duration, onClose } = this.props;
        const { animatedSize, pan } = this.state;
        if (visible) {
            this.setState({ modalVisible: visible });
            Animated.timing(animatedSize, {
                toValue: size,
                duration
            }).start();
        } else {
            Animated.timing(animatedSize, {
                toValue: minClosingSize,
                duration
            }).start(() => {
                pan.setValue({ x: 0, y: 0 });
                this.setState({
                    modalVisible: visible,
                    animatedSize: new Animated.Value(0)
                });

                if (typeof onClose === "function") onClose();
            });
        }
    }

    createPanResponder(props) {
        const { closeOnDragDown, size } = props;
        const { pan } = this.state;
        this.panResponder = PanResponder.create({
            onStartShouldSetPanResponder: () => closeOnDragDown,
            onPanResponderMove: (e, gestureState) => {
                if (this.isSide() && gestureState.dx > 0) {
                    Animated.event([null, { dx: pan.x }])(e, gestureState);
                }
                else if (!this.isSide() && gestureState.dy > 0) {
                    Animated.event([null, { dy: pan.y }])(e, gestureState);
                }
            },
            onPanResponderRelease: (e, gestureState) => {
                if (this.onPanResponderReleaseControl(size, gestureState)) {
                    this.setModalVisible(false);
                } else {
                    Animated.spring(pan, { toValue: { x: 0, y: 0 } }).start();
                }
            }
        });
    }
    open() {
        this.setModalVisible(true);
    }

    close() {
        this.setModalVisible(false);
    }

    render() {
        const { animationType, closeOnPressMask, children, customStyles } = this.props;
        const { animatedSize, pan, modalVisible } = this.state;
        const panStyle = {
            transform: pan.getTranslateTransform()
        };

        return (
            <Modal
                transparent
                animationType={animationType}
                visible={modalVisible}
                supportedOrientations={SUPPORTED_ORIENTATIONS}
                onRequestClose={() => {
                    this.setModalVisible(false);
                }}
            >
                <View style={[styles.wrapper, customStyles.wrapper, this.isSide() && { flexDirection: 'row' }]}>
                    <TouchableOpacity
                        style={styles.mask}
                        activeOpacity={1}
                        onPress={() => (closeOnPressMask ? this.close() : {})}
                    />
                    <Animated.View
                        {...this.panResponder.panHandlers}
                        style={[panStyle, styles.container, customStyles.container, this.isSide() ? styles.sides : styles.upDown, this.isSide() ? { width: animatedSize } : { height: animatedSize }]}
                    >
                        {children}
                    </Animated.View>
                </View>
            </Modal>
        );
    }
}

Sheeter.propTypes = {
    animationType: PropTypes.oneOf(["none", "slide", "fade"]),
    type: PropTypes.oneOf(["bottom", "right", "left", "top"]),
    size: PropTypes.number,
    minClosingSize: PropTypes.number,
    duration: PropTypes.number,
    closeOnDragDown: PropTypes.bool,
    closeOnPressMask: PropTypes.bool,
    customStyles: PropTypes.objectOf(PropTypes.object),
    onClose: PropTypes.func,
    children: PropTypes.node
};

Sheeter.defaultProps = {
    animationType: "none",
    type: "bottom",
    size: 300,
    minClosingSize: 0,
    minClosingHeight: 0,
    duration: 300,
    closeOnDragDown: false,
    closeOnPressMask: true,
    customStyles: {},
    onClose: null,
    children: <View />
};

export default Sheeter;