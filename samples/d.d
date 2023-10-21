/*
 * Some block commments
 * go here
 */

/+
 + Nesting comment
 +/

/// A single line documentation comment
module net.masterthought.cucumber.report_information;

import std.algorithm;
import std.array;
import std.string;
import std.conv : to; // line comment about this import

import jsonizer.tojson;
import net.masterthought.cucumber.report_parser;

/**
 * A documentation comment
 */
@safe:
class ReportInformation
{

  deprecated string originalId = "Some text\twith a gap";

  string runId = `Some \n Text`;

  string anotherId = "\&para;\U0001F603"; // ¶😃

  Feature[] features;

  private auto symbol = '£';

  private string m_name;
  @property string name()
  {
    return m_name;
  }

  this(ReportParser parser)
  {
    this.runId = parser.getRunId();
    this.features = parser.getReports().map!(report => report.getFeatures()).joiner.array;
  }

  private Feature[] processFeatures(Feature[] features)
  {
    return features.map!((f) {
      f.featureInformation = calculateFeatureInformation(f);
      f.scenarios = addScenarioInformation(f);
      return f;
    }).array;
  }

  public auto getTotalNumberOfBackgroundScenariosUnknown()
  {
    return features.map!(f => f.getBackgroundScenariosUnknown().length).sum;
  }
}

struct
{
  string name;
}

union
{
  string day;
}

unittest
{
  // load test json from file
  auto testJson = to!string(read("src/test/resources/project1.json"));
  string runId = "run 1";
  ReportInformation ri = new ReportInformation(new ReportParser(runId, [
    testJson
  ]));

  assert(ri.name != null);
  // should have correct number of features
  ri.getFeatures().length.assertEqual(2);

  // overall status
  ri.getOverallStatus.assertEqual(to!string(Status.Failed));

  // feature totals
  Feature feature = ri.getFeatures().front;

}

T foo(T, E:
    Exception)(Node node, in string path)
{
  return node.bar!(T, E)(path);
}
