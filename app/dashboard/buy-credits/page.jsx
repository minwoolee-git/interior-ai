"use client";

import React, { useContext, useState } from "react";
import { PayPalButtons } from "@paypal/react-paypal-js";
import { useRouter } from "next/navigation";

import { db } from "../../../config/db";
import { Users } from "../../../config/schema";
import { UserDetailContext } from "../../_context/UserDetailContext";

function BuyCredits() {
  const [selectedOption, setSelectedOption] = useState([]);
  const { userDetail, setUserDetail } = useContext(UserDetailContext);
  const router = useRouter();

  const creditsOption = [
    {
      credits: 5,
      amount: 0.99,
    },
    {
      credits: 10,
      amount: 1.99,
    },
    {
      credits: 25,
      amount: 3.99,
    },
    {
      credits: 50,
      amount: 6.99,
    },
    {
      credits: 100,
      amount: 9.99,
    },
  ];

  const onPaymentSuccess = async () => {
    console.log("Payment Success...");

    const result = await db
      .update(Users)
      .set({
        credits: userDetail?.credits + selectedOption?.credits,
      })
      .returning({ id: Users.id });

    if (result) {
      setUserDetail((prev) => ({
        ...prev,
        credits: userDetail?.credits + selectedOption?.credits,
      }));

      router.push("/dashboard");
    }
  };

  return (
    <div>
      <div className="text-2xl font-bold text-center mt-8 mb-6">
        Buy More Credits
      </div>

      <div className="flex flex-row gap-4 justify-center">
        {creditsOption.map((item, index) => (
          <div
            key={index}
            className={`card bg-base-100 w-44 shadow-xl ${
              selectedOption?.credits === item.credits
                ? "border-2 border-primary"
                : ""
            }`}
          >
            <div className="card-body p-4 items-center text-center">
              <h2 className="card-title">{item.credits} Credits</h2>
              <p>for ${item.amount}</p>

              <button
                className="btn btn-primary"
                onClick={() => setSelectedOption(item)}
              >
                Select
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="max-w-3xl mx-auto mt-8 px-4">
        {selectedOption?.amount && (
          <PayPalButtons
            style={{ layout: "horizontal" }}
            createOrder={(data, actions) => {
              return actions.order.create({
                purchase_units: [
                  {
                    amount: {
                      value: selectedOption?.amount?.toFixed(2),
                      currency_code: "USD",
                    },
                  },
                ],
              });
            }}
            onApprove={() => onPaymentSuccess()}
            onCancel={() => console.log("Payment Cancelled")}
          />
        )}
      </div>
    </div>
  );
}

export default BuyCredits;