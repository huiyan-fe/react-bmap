/**
 * @file 步行路径导航
 * @author github.com/rainbowflesh
 */

import Component from "./component";

export default class WalkingRoute extends Component {
  constructor(args) {
    super(args);
    this.state = {};
  }

  static get defaultProps() {
    return {};
  }

  componentDidUpdate(prevProps) {
    this.initialize();
  }

  componentDidMount() {
    this.initialize();
  }

  componentWillUnmount() {
    this.destroy();
  }

  destroy() {
    this.walking && this.walking.clearResults();
    this.walking = null;
  }

  initialize() {
    var map = this.props.map;
    if (!map) {
      return;
    }
    this.destroy();

    if (!this.walking) {
      this.walking = new BMap.WalkingRoute(map, {
        renderOptions: {
          map: map,
          autoViewport: this.props.autoViewport !== undefined ? this.props.autoViewport : true,
          viewportOptions: { zoomFactor: -1 },
        },
      });
    }

    var start = this.props.start;
    var end = this.props.end;

    if (start.lng && start.lat) {
      start = new BMap.Point(start.lng, start.lat);
    }

    if (end.lng && end.lat) {
      end = new BMap.Point(end.lng, end.lat);
    }

    this.walking.search(start, end);
  }
}
