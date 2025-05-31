using Newtonsoft.Json;
using Reown.Core.Models.Relay;

namespace Reown.Core.Models.Subscriber
{
    /// <summary>
    ///     Represents a subscription that's pending
    /// </summary>
    public class PendingSubscription : SubscribeOptions
    {
        /// <summary>
        ///     The topic that will be subscribed to
        /// </summary>
        [JsonProperty("topic")]
        public string Topic;
    }
}