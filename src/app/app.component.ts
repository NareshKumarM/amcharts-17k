import { Component, NgZone, OnInit, AfterViewInit, OnDestroy } from "@angular/core";
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import am4themes_frozen from '@amcharts/amcharts4/themes/frozen';
import data from './aa/energy';

@Component({
  selector: 'my-app',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, AfterViewInit, OnDestroy {
  private chart: am4charts.XYChart;
  private dateAxis;
  private chartData;

  constructor(private zone: NgZone) { }

  ngOnInit() {
  }

  ngAfterViewInit() {
    this.zone.runOutsideAngular(() => {
      // REGION Consumption Graph
      const chart = am4core.create('chartdiv', am4charts.XYChart);
      am4core.options.minPolylineStep = 5;

      this.chartData = [];
      // Data from API

      data.forEach(element => {
        const temp = { readDatetime: new Date(element.readDatetime), kWh: element.netKwh, kVArh: element.exportKvarh };
        this.chartData.push(temp);
      });

      chart.data = this.chartData;

      // Create X axis
      this.dateAxis = chart.xAxes.push(new am4charts.DateAxis());
      this.dateAxis.renderer.minGridDistance = 60;
      this.dateAxis.tooltipDateFormat = 'dd-MMM-yyyy';
      this.dateAxis.renderer.labels.template.fontSize = 13;

      // Create Y axis
      const valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
      valueAxis.cursorTooltipEnabled = false;
      valueAxis.renderer.labels.template.fontSize = 13;
      valueAxis.title.text = 'kWh';
      valueAxis.title.fontSize = 13;

      // Create main graph series
      const consumption = chart.series.push(new am4charts.LineSeries());
      consumption.stroke = am4core.color('#51799f');
      consumption.dataFields.valueY = 'kWh';
      consumption.dataFields.dateX = 'readDatetime';
      consumption.tooltipText = '{kWh} kWh';
      consumption.tooltip.pointerOrientation = 'vertical';
      consumption.legendSettings.labelText = 'Consumption (kWh)';

      chart.cursor = new am4charts.XYCursor();
      chart.cursor.xAxis = this.dateAxis;
      chart.cursor.snapToSeries = consumption;

      /*Baseline*/
      const baseline = chart.series.push(new am4charts.LineSeries());
      baseline.stroke = am4core.color('#000000'); // red
      baseline.strokeWidth = 1.5; // 3px
      baseline.dataFields.valueY = 'kVArh';
      baseline.dataFields.dateX = 'readDatetime';
      baseline.legendSettings.labelText = 'Baseline';

      /*chart zoom & pan*/
      chart.scrollbarX = new am4charts.XYChartScrollbar();
      chart.scrollbarX.series.push(consumption);
      chart.scrollbarX.thumb.minWidth = 50;
      chart.scrollbarX.parent = chart.bottomAxesContainer;

      /*Sample for indicating projects on the graph*/
      const range = this.dateAxis.axisRanges.create();
      range.date = new Date(2020, 1, 1);
      range.contents.stroke = am4core.color('#000');
      range.axisFill.fill = am4core.color('#f00');
      range.axisFill.fillOpacity = 1;
      range.label.text = 'LED Mop UP';
      range.label.inside = true;
      range.label.rotation = 90;
      range.label.horizontalCenter = 'right';
      range.label.verticalCenter = 'bottom';

      /*Sample values to color the graph regions based on the variance from baseline offset values*/
      const colorRangeLib = [
        {// Red
          dateFrom: new Date('01-02-2018'),
          dateTo: new Date('02-10-2018'),
          rangeColor: am4core.color('#f00')
        },
        {// Blue
          dateFrom: new Date('23-08-2018'),
          dateTo: new Date('03-10-2018'),
          rangeColor: am4core.color('#51799f')
        },
        {// Green
          dateFrom: new Date('03-10-2018'),
          dateTo: new Date('02-12-2018'),
          rangeColor: am4core.color('#1f911f')
        }
      ];

      colorRangeLib.forEach((dataItem) => {
        const increase = this.dateAxis.createSeriesRange(consumption);
        increase.date = dataItem.dateFrom;
        increase.endDate = dataItem.dateTo;
        increase.contents.stroke = dataItem.rangeColor;
        increase.contents.fill = dataItem.rangeColor;
        increase.contents.fillOpacity = 1;
      });

      /* Custom container for legend */
      const legendContainer = am4core.create('legenddiv', am4core.Container);
      legendContainer.width = am4core.percent(100);
      legendContainer.height = am4core.percent(100);
      chart.legend = new am4charts.Legend();
      chart.legend.fontSize = 14;
      chart.legend.contentAlign = 'right';
      chart.legend.parent = legendContainer;
      // ENDREGION Consumption Graph
    });
  }

  ngOnDestroy() {
    this.zone.runOutsideAngular(() => {
      if (this.chart) {
        this.chart.dispose();
      }
    });
  }
}
