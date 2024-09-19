import React from "react";

interface ResizeObservableProps {
  onResize: () => void;
}

class ResizeObservable extends React.Component<ResizeObservableProps> {
  observer: ResizeObserver | null = null;

  componentDidMount() {
    this.observer = new ResizeObserver(this.handleResize);
    this.observer.observe(document.body);
  }

  componentWillUnmount() {
    if (this.observer) {
      this.observer.disconnect();
    }
  }

  handleResize: ResizeObserverCallback = (data: any) => {
    console.log("data :>> ", data[0].contentRect);
    this.props.onResize();
  };

  render() {
    return null;
  }
}

export default ResizeObservable;
