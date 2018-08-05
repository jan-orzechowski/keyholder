using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Keyholder.Models
{
    public static class LevelJsonSchema
    {
        public const string Schema = @"
        {
          ""$schema"": ""http://json-schema.org/draft-07/schema#"",
          ""definitions"": {
            ""mapObject"": {
              ""type"": ""array"",
              ""items"": {
                ""type"": ""object"",
                ""properties"": {
                  ""x"": {
                    ""type"": ""number""
                  },
                  ""y"": {
                    ""type"": ""number""
                  },
                  ""colorID"": {
                    ""type"": ""number""
                  }
                },
                ""minProperties"": 3,
                ""maxProperties"": 3,
                ""required"": [
                  ""x"",
                  ""y"",
                  ""colorID""
                ]
              }
            }
          },
          ""properties"": {
            ""startX"": {
              ""type"": ""number""
            },
            ""startY"": {
              ""type"": ""number""
            },
            ""width"": {
              ""type"": ""number""
            },
            ""height"": {
              ""type"": ""number""
            },
            ""tiles"": {
              ""type"": ""array"",
              ""items"": {
                ""type"": ""array"",
                ""items"": {
                  ""type"": ""number""
                },
                ""minItems"": 2,
                ""maxItems"": 2
              }
            },
            ""keys"": {
              ""$ref"": ""#/definitions/mapObject""
            },
            ""chests"": {
              ""$ref"": ""#/definitions/mapObject""
            },
            ""gates"": {
              ""$ref"": ""#/definitions/mapObject""
            }
          },
          ""required"": [
            ""startX"",
            ""startY"",
            ""width"",
            ""height"",
            ""tiles"",
            ""keys"",
            ""chests"",
            ""gates""
          ],
          ""minProperties"": 8,
          ""maxProperties"": 8
        }";
    }
}